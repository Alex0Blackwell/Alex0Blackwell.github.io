"""Real browser checks for the full-page SVG doodle."""
import json
import os
import time
from check_site import Browser

OUT = os.path.join(os.path.dirname(__file__), 'artifacts')

def state(b):
    return b.evaluate('window.__deskScene.snapshot()')

def item(s, name):
    return next(v for v in s['objects'] if v['id'] == name)

def settled(b, timeout=35):
    deadline = time.time() + timeout
    while time.time() < deadline:
        s = state(b)
        if not any(v['dirty'] or v['held'] for v in s['objects']) and s['typing']:
            assert all(sum(abs(a-z) for a,z in zip(v['position'],v['home'])) < 1 for v in s['objects'])
            return s
        time.sleep(.2)
    raise AssertionError('Recovery timed out: '+json.dumps(s))

def key(b, value, code, number):
    for kind in ('keyDown','keyUp'):
        b.call('Input.dispatchKeyEvent',{'type':kind,'key':value,'code':code,'windowsVirtualKeyCode':number})

def layout(b, width):
    v=b.evaluate("""({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      pageHeight:document.querySelector('main').offsetHeight,
      world:(()=>{const r=document.querySelector('#world').getBoundingClientRect();return {width:r.width,height:r.height}})(),
      title:document.querySelector('h1').textContent,role:document.querySelector('.role').textContent,
      education:document.querySelector('.education').textContent,pause:!!document.querySelector('#pause'),
      canvas:!!document.querySelector('canvas'),blank:document.elementFromPoint(10,100).tagName,
      resources:performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize}))})""")
    assert v['scrollWidth'] <= width,v
    assert v['title']=='Alex Blackwell' and v['role']=='Backend Software Developer',v
    assert v['education']=='Simon Fraser University Computing Science',v
    assert not v['pause'] and not v['canvas'],v
    assert v['world']['height']==v['pageHeight'] and v['blank'] not in ('svg','g','path'),v
    return v

def interruption(b):
    b.evaluate('window.__deskScene.reset()')
    for _ in range(3):
        b.evaluate("window.__deskScene.nudge('computer','left')")
    deadline=time.time()+20
    while time.time()<deadline:
        current=state(b)
        if current['mission'] and current['mission']['phase']=='carry':
            break
        time.sleep(.05)
    else:
        raise AssertionError('Computer retrieval did not start')
    b.evaluate("window.__deskScene.nudge('character','lift')")
    result=settled(b,45)
    print('PASS interruption while carrying and eventual recovery',flush=True)
    return result

def run():
    os.makedirs(OUT,exist_ok=True)
    b=Browser()
    report={'drags':[]}
    try:
        b.call('Emulation.setScriptExecutionDisabled',{'value':False})
        b.call('Emulation.setEmulatedMedia',{'features':[]})
        b.viewport(1440,1000)
        b.open()
        report['desktop']=layout(b,1440)
        assert state(b)['mode']=='2d'
        first=b.evaluate("document.querySelector('#arm-near').getAttribute('transform')")
        time.sleep(.15)
        assert first!=b.evaluate("document.querySelector('#arm-near').getAttribute('transform')")
        b.screenshot(os.path.join(OUT,'doodle-desktop.png'))
        print('PASS full-page SVG layout and default typing',flush=True)
        for name in ('character','chair','computer','lamp','desk'):
            b.evaluate('window.__deskScene.reset()')
            initial=state(b)
            point=b.evaluate('window.__deskScene.project('+json.dumps(name)+')')
            start=(point['x'],point['y'])
            end=(150,100) if name=='character' else (max(70,start[0]-220),max(75,start[1]-110))
            b.drag(start,end,steps=22,duration=.55,release=False)
            time.sleep(.15)
            held=state(b)
            assert item(held,name)['held'],('Wrong object grabbed',name,held)
            assert sum(abs(a-z) for a,z in zip(item(initial,name)['position'],item(held,name)['position']))>40
            if name=='character':
                assert held['character']['pose']=='held',held['character']
                actual=b.evaluate("window.__deskScene.project('character')")
                assert abs(actual['x']-150)<18 and abs(actual['y']-100)<18,actual
                b.screenshot(os.path.join(OUT,'doodle-whole-page.png'))
            if name=='chair':
                assert item(held,'character')['position']==item(held,'chair')['position']
            assert b.evaluate("document.querySelector('#speech').classList.contains('visible')")
            b.mouse('mouseReleased',*end)
            report['drags'].append({'id':name,'held':held,'settled':settled(b)})
            if name=='character':
                p=b.evaluate("window.__deskScene.project('character')")
                # Reach the lower page by going around the table's right end.
                end_x=state(b)['navigation']['barrier']['right']+35
                b.drag((p['x'],p['y']),(end_x,p['y']),release=False)
                for step in range(1,31):
                    b.mouse('mouseMoved',end_x,p['y']+(950-p['y'])*step/30,True)
                    time.sleep(.025)
                time.sleep(.15)
                assert b.evaluate("window.__deskScene.project('character').y")>910
                b.mouse('mouseReleased',end_x,950)
                settled(b)
            print('PASS mouse, speech, recovery: '+name,flush=True)
        for name in ('desk','computer','lamp','chair','character'):
            b.evaluate('window.__deskScene.nudge('+json.dumps(name)+',"right")')
        report['multiple']=settled(b,45)
        report['interruption']=interruption(b)
        key(b,'3','Digit3',51)
        key(b,'ArrowLeft','ArrowLeft',37)
        key(b,' ','Space',32)
        assert item(state(b),'computer')['dirty']
        key(b,'r','KeyR',82)
        settled(b)
        print('PASS simultaneous disruption and keyboard controls',flush=True)
        b.viewport(390,844,True)
        b.open()
        report['mobile']=layout(b,390)
        b.screenshot(os.path.join(OUT,'doodle-mobile.png'))
        point=b.evaluate("window.__deskScene.project('character')")
        b.touch_drag((point['x'],point['y']),(90,105),release=False)
        time.sleep(.1)
        assert item(state(b),'character')['held']
        b.screenshot(os.path.join(OUT,'doodle-mobile-drag.png'))
        b.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        settled(b)
        b.viewport(320,740,True)
        time.sleep(.25)
        report['narrow']=layout(b,320)
        b.screenshot(os.path.join(OUT,'doodle-small.png'))
        print('PASS phone touch and 320px layout',flush=True)
        b.viewport(390,600,True)
        b.open()
        b.touch_drag((5,480),(5,230))
        time.sleep(.3)
        assert b.evaluate('scrollY')>0,'Blank page space did not scroll'
        assert not any(v['held'] for v in state(b)['objects'])
        b.evaluate('scrollTo(0,0)')
        print('PASS touch scrolling outside the drawing',flush=True)
        b.call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
        b.open()
        first=b.evaluate("document.querySelector('#arm-near').getAttribute('transform')")
        time.sleep(.2)
        assert first==b.evaluate("document.querySelector('#arm-near').getAttribute('transform')")
        b.evaluate("window.__deskScene.nudge('computer','left')")
        settled(b)
        b.call('Emulation.setScriptExecutionDisabled',{'value':True})
        b.open(wait_scene=False)
        assert b.evaluate("document.querySelectorAll('#world path').length")>15
        b.call('Emulation.setScriptExecutionDisabled',{'value':False})
        b.call('Emulation.setEmulatedMedia',{'features':[]})
        b.viewport(1440,1000)
        b.open()
        report['errors']=b.errors()
        assert not report['errors'],report['errors']
        report['passed']=True
        print('PASS reduced motion, static SVG without JavaScript, no browser errors',flush=True)
    except Exception as error:
        report['passed']=False
        report['failure']=str(error)
        b.screenshot(os.path.join(OUT,'doodle-failure.png'))
        raise
    finally:
        with open(os.path.join(OUT,'doodle-report.json'),'w',encoding='utf-8') as output:
            json.dump(report,output,indent=2)
        b.close()

if __name__=='__main__':
    run()

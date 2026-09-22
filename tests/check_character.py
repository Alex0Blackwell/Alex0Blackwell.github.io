"""Visual pose atlas and recovery coverage for the reference-sheet character."""
import json
import os
import time
from pathlib import Path
from check_site import Browser
from check_doodle import settled, state

OUT = Path(__file__).parent / 'artifacts'
POSES = [
    ('Neutral', 'neutral', 'front', 0), ('Left', 'walking', 'left', 40),
    ('Right', 'walking', 'right', 0), ('Back', 'walking', 'back', 0),
    ('Typing', 'typing', 'left', 0), ('Picked up', 'held', 'front', 0),
    ('Carrying', 'carrying', 'left', 30), ('Picking up', 'pickup', 'left', 0),
    ('Wave', 'wave', 'front', 0), ('Happy', 'happy', 'front', 0),
    ('Sitting', 'ground-sitting', 'front', 0), ('Putting down', 'placing', 'left', 0),
]

def atlas():
    OUT.mkdir(exist_ok=True)
    poses = json.dumps(POSES)
    (OUT / 'character-poses.html').write_text('''<!doctype html><meta charset="utf-8"><link rel="icon" href="../../favicon.svg">
<style>body{margin:0;background:white;font:13px Arial;color:#555}svg{display:block}.ink{stroke:#252525;stroke-width:2.8;fill:white;stroke-linecap:round;stroke-linejoin:round}text{stroke:none;fill:#555}</style>
<svg id="atlas" width="1200" height="1000" viewBox="0 0 1200 1000"></svg>
<script src="../../js/character.js"></script><script>
const poses=''' + poses + ''';
poses.forEach(([label,pose,facing,distance],i)=>{
 const root=document.createElementNS('http://www.w3.org/2000/svg','g');
 root.setAttribute('class','ink');root.setAttribute('transform',`translate(${150+(i%4)*300} ${295+Math.floor(i/4)*330}) scale(.8)`);
 document.querySelector('#atlas').append(root);
 const actor=createDoodleCharacter(root);
 actor.animate(1,{pose,facing,distance,progress:.5,moving:pose==='walking'||pose==='carrying',instant:true});
 const text=document.createElementNS(root.namespaceURI,'text');text.setAttribute('x',150+(i%4)*300);text.setAttribute('y',318+Math.floor(i/4)*330);text.setAttribute('text-anchor','middle');text.textContent=label;document.querySelector('#atlas').append(text);
});</script>''', encoding='utf-8')

def run():
    atlas()
    b=Browser()
    b.viewport(1200,1000)
    b.open('http://127.0.0.1:8000/tests/artifacts/character-poses.html',wait_scene=False)
    b.screenshot(str(OUT/'character-poses.png'))
    assert not b.errors(),b.errors()
    b.viewport(1440,1000)
    b.open()
    assert state(b)['character']['facing']=='left'
    assert b.evaluate("Number(document.querySelector('#eye-right').getAttribute('opacity'))") > .95
    # A long retrieval exercises the complete walk cycle and all recovery poses.
    for _ in range(8):
        b.evaluate("window.__deskScene.nudge('computer','left')")
    poses=set(); frames=set(); facings=set()
    deadline=time.time()+35
    while time.time()<deadline:
        s=state(b); actor=s['character']
        poses.add(actor['pose']); facings.add(actor['facing'])
        if actor['walkFrame']: frames.add(actor['walkFrame'])
        if s['typing'] and not any(body['dirty'] for body in s['objects']): break
        time.sleep(.025)
    else: raise AssertionError('Retrieval did not finish')
    assert {'walking','pickup','carrying','placing','happy','sitting-down','typing'}<=poses,poses
    assert len(frames)==8,frames
    assert {'left','right'}<=facings,facings
    assert not b.errors(),b.errors()
    print('PASS all eight gait frames, left/right facing, pickup/carry/place/sit/typing, no console errors')
    (OUT/'character-report.json').write_text(json.dumps({'poses':sorted(poses),'frames':sorted(frames),'facings':sorted(facings),'passed':True},indent=2))
    b.close()

if __name__=='__main__': run()

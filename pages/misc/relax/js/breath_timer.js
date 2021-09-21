class BreathTimer {
    static constructor() {
        this.breathing = false;
        this.breath_status_el = document.getElementById("breath-status");
        this.breath_in_timeout = null;
        this.breath_out_timeout = null;
    }


    static async start_breathing(breath_in_time, breath_out_time) {
        this.breathing = true;

        while(this.breathing) {
            this._breath_in();
            await this._async_timeout(this._delay, breath_in_time);
            this._breath_out();
            await this._async_timeout(this._delay, breath_in_time);
            // await this._async_timeout(this._breath_out, breath_out_time);
        }
    }


    static end_breathing() {
        window.clearTimeout(this.breath_in_timeout);
        window.clearTimeout(this.breath_out_timeout);
    }


    static async _async_timeout(function_to_execute, delay) {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(function_to_execute, delay, resolve);
            } catch (error) {
                reject(error);
            }
        });
    }


    static _breath_in() {
        console.log("breath in");
        // resolve("yep");
        document.getElementById("breath-status").innerHTML = "breath in";
        // this.breath_status_el.innerHTML = "breath in";
    }


    static _breath_out() {
        console.log("breath out");
        // resolve("yep");
        document.getElementById("breath-status").innerHTML = "breath out";
    }


    static _delay(resolve) {
        console.log("delay");
        resolve("yep");
    }
}


async function start_relaxation() {
    await BreathTimer.start_breathing(2000, 2000);
}

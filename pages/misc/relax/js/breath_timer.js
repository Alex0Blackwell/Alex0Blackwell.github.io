class BreathTimer {
    static constructor() {
        this.breathing = false;
        this.breath_status_el = document.getElementById("breath-status");
        this.timeout = null;
    }


    static async start_breathing(breath_in_time, breath_out_time) {
        document.getElementById("breath-dot").classList.add("colour-breath");
        document.getElementById("breath-status").style.display = "block";
        this.breathing = true;

        while(this.breathing) {
            this._breath_in();
            await this._delay(breath_in_time);
            this._breath_out();
            await this._delay(breath_out_time);
        }
    }


    static end_breathing() {
        document.getElementById("breath-dot").classList.remove("colour-breath");
        document.getElementById("breath-status").innerHTML = "";
        this.breathing = false;
    }


    static _breath_in() {
        document.getElementById("breath-status").innerHTML = "Breath In";
    }


    static _breath_out() {
        document.getElementById("breath-status").innerHTML = "Breath Out";
    }


    static async _delay(time_to_delay) {
        return new Promise((resolve, reject) => {
            clearTimeout(this.timeout);
            try {
                this.timeout = setTimeout(() => {
                    resolve();
                }, time_to_delay);
            } catch (error) {
                reject(error);
            }
        });
    }
}


function start_relaxation() {
    BreathTimer.start_breathing(4000, 6000);
    const start_btn = document.getElementById("start-btn");
    start_btn.disabled = true;
}


function stop_relaxation() {
    BreathTimer.end_breathing();
    const start_btn = document.getElementById("start-btn");
    start_btn.disabled = false;
}

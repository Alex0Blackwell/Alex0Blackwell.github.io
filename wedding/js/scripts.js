mocking = false

let people_json = JSON.parse(`{
    "Cam": {
        "id": "toffo6t1",
        "rsvp_status": "Pending",
        "is_driving": false,
        "cabin": 1,
        "roommate": "Shawn",
        "relation": "is Annika's mom."
    },
    "Shawn": {
        "id": "hks1l74g",
        "rsvp_status": "Pending",
        "is_driving": false,
        "cabin": 1,
        "roommate": "Cam",
        "relation": "is Cam's husband."
    },
    "Jonathan": {
        "id": "7m288h31",
        "rsvp_status": "Pending",
        "is_driving": false,
        "cabin": 1,
        "roommate": "nobody",
        "relation": "is Annika's brother."
    },
    "Alec": {
        "id": "ibsmqid3",
        "rsvp_status": "Pending",
        "is_driving": false,
        "cabin": 1,
        "roommate": "nobody",
        "relation": "is Annika's brother."
    }
}`);

const url = new URLSearchParams(window.location.search);
const url_id = url.get('id');


cabin_to_people = {};
person_to_info = {};
id_to_person = {}

person_name = null
person_info = null


async function get_person_data(is_mocked=True) {
    if(is_mocked) {
        people_json = people_json;
        await new Promise(r => setTimeout(r, 800));
    } else {
        const url = "https://api.jsonbin.io/v3/b/674689fbacd3cb34a8af8bb1/latest?meta=false";
        try {
            const response = await fetch(url,{
                headers: {
                    "X-Master-Key": "$2a$10$Pd0/C2pi1.OI5wO91QPcgukaOc7UfDNeKrDi5ZyjsHUHrnMik4c/u",
                }
            });
            if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
            }
            const json = await response.json();
            people_json = json;
        } catch (error) {
            console.error(error.message);
        }
    }
}


async function post_person_data(is_mocked=True) {
    let is_successful = false;
    if(is_mocked) {
        // Do nothing
        await new Promise(r => setTimeout(r, 800));
        is_successful = true;
    } else {
        const url = "https://api.jsonbin.io/v3/b/674689fbacd3cb34a8af8bb1";
        try {
            const response = await fetch(url, {
                method: "PUT",
                body: JSON.stringify(people_json),
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": "$2a$10$Pd0/C2pi1.OI5wO91QPcgukaOc7UfDNeKrDi5ZyjsHUHrnMik4c/u",
                }
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const json = await response.json();
            is_successful = response.ok;
        } catch (error) {
            console.error(error.message);
        }
    }
    return is_successful;
}


function build_person_mappings() {
    for (const person_name in people_json) {
        let person_info = people_json[person_name]
        person_to_info[person_name] = person_info;
        id_to_person[person_info.id] = person_name;
        if(!cabin_to_people[person_info.cabin]) {
            cabin_to_people[person_info.cabin] = [];
        }
        cabin_to_people[person_info.cabin].push(person_name);
    } 
    person_name = id_to_person[url_id];
    person_info = person_to_info[person_name];
}

function fill_modal(person_name) {
    let person = person_to_info[person_name];
    document.getElementById("modal-name").innerHTML = person_name;
    document.getElementById("modal-image").src = `assets/img/people/${person_name.toLowerCase()}.png`;

    let person_description = (
        `
        ${person_name} ${person.relation} ${person_name}'s RSVP status is "${person.rsvp_status}."
        `
    );
    if(person.roommate != "nobody") {
        person_description += `${person_name} will be sharing a room with ${person.roommate} in Cabin ${person.cabin}. `
    } else {
        person_description += `${person_name} will be in Cabin ${person.cabin}. `
    }
    if(person.is_driving) {
        person_description += `${person_name} said they may be able to drive, so reach out to carpool!`

    }
    document.getElementById("modal-text").innerHTML = person_description
}


function populate_cabins() {
    /**
     * 
     * This creates the following...
     * 
        <div class="col-md-6 col-lg-4 mb-5">
            <div class="cabin drop-shadow mx-auto text-center" >
                <div class="cabin-header">
                    <h3>Cabin 1</h3>
                </div>
                <div class="person-list">
                    <div class="portfolio-item person-item border-btm text-start" data-bs-toggle="modal" data-bs-target="#portfolioModal1", onclick="fill_modal('Daniel')">
                        <div class="divider-custom">
                            <img class="mini-avatar" src="assets/img/people/daniel.png" alt="..." />
                            Daniel
                            <div class="divider-custom-icon"><i class=" fa-solid fa-circle"></i></div>
                            Pending
                        </div>
                    </div>
                </div>
            </div>
        </div>
     */
    template_holder = document.getElementById("cabin-grid")
    // Clear anything in here...
    template_holder.innerHTML = ""


    // For each cabin...
    for(let i=0, cabin_num = 1; i < Object.keys(cabin_to_people).length; ++i, ++cabin_num) {
        let cabin_card_dom = document.createElement("div")
        cabin_card_dom.setAttribute("class", "col-md-6 col-lg-4 mb-5")
        let inner_card_dom = document.createElement("div")
        inner_card_dom.setAttribute("class", "cabin drop-shadow mx-auto text-center")

        let cabin_number_dom = document.createElement("div")
        cabin_number_dom.setAttribute("class", "cabin-header")
        let cabin_text_dom = document.createElement("h3")
        cabin_text_dom.innerHTML = `Cabin ${cabin_num}`
        cabin_number_dom.appendChild(cabin_text_dom)

        let person_list_dom = document.createElement("div")
        person_list_dom.setAttribute("class", "person-list")

        // For each person in the cabin...
        for(let j=0; j < cabin_to_people[cabin_num].length; ++j) {
            let person_name = cabin_to_people[cabin_num][j]
            let person_info = person_to_info[person_name]
            let person_row_dom = document.createElement("div")
            person_row_dom.setAttribute("data-bs-toggle", "modal")
            person_row_dom.setAttribute("data-bs-target", "#portfolioModal1")
            person_row_dom.setAttribute("onclick", `fill_modal('${person_name}')`)
            
            let is_last_row = (j == cabin_to_people[cabin_num].length - 1)
            if(is_last_row)
                person_row_dom.setAttribute("class", "portfolio-item person-item text-start")
            else
                person_row_dom.setAttribute("class", "portfolio-item person-item text-start border-btm")

            let person_icon_dom = document.createElement("div")
            person_icon_dom.setAttribute("class", "divider-custom")

            let person_avatar = document.createElement("img")
            person_avatar.setAttribute("class", "mini-avatar")
            person_avatar.setAttribute("src", `assets/img/people/${person_name.toLowerCase()}.png`)
            person_icon_dom.appendChild(person_avatar)

            let person_text = document.createElement("p")
            person_text.setAttribute("class", "margin-0")
            person_text.innerHTML = person_name
            person_icon_dom.appendChild(person_text)
            
            let person_divider_dom = document.createElement("div")
            person_divider_dom.setAttribute("class", "divider-custom-icon")
            let dot_icon = document.createElement("i")
            dot_icon.setAttribute("class", `fa-solid fa-circle rvsp-${person_info.rsvp_status.split(" ").join("-")}`)
            person_divider_dom.appendChild(dot_icon)
            person_icon_dom.appendChild(person_divider_dom)

            let status_text = document.createElement("p")
            status_text.setAttribute("class", "margin-0")
            status_text.innerHTML = person_info.rsvp_status
            person_icon_dom.appendChild(status_text)

            person_row_dom.appendChild(person_icon_dom)
            person_list_dom.appendChild(person_row_dom)
        }

        inner_card_dom.appendChild(cabin_number_dom)
        inner_card_dom.appendChild(person_list_dom)
        cabin_card_dom.appendChild(inner_card_dom)

        template_holder.appendChild(cabin_card_dom)
    }
}

function set_cabin_number() {
    document.getElementById("your-cabin-number").innerHTML = `You are Cabin ${person_info.cabin}`
}


function main_page_setup() {
    document.getElementById("main-page-welcome").innerHTML = `<br>Welcome ${person_name}!`
    set_cabin_number();
    populate_cabins();

    document.getElementById("ftue").style.display = "none";
    document.getElementById("landing").style.display = "none";
    document.getElementById("main-page").style.display = "block";
}


function submit_rsvp() {
    // Update people_json here.
    let rsvp_status = document.querySelector('input[name="rsvp-radio"]:checked').value;
    let drive_status = document.querySelector('input[name="drive-radio"]:checked').value;
    people_json[person_name].rsvp_status = rsvp_status;
    people_json[person_name].is_driving = drive_status;

    main_page_setup()
    // Update the DB out-of-band.
    post_person_data(is_mocked=mocking);
}


async function submit_rsvp_main_page() {
    // Update people_json here.
    let rsvp_status = document.querySelector('input[name="post-rsvp-radio"]:checked').value;
    let drive_status = document.querySelector('input[name="post-drive-radio"]:checked').value;
    people_json[person_name].rsvp_status = rsvp_status;
    people_json[person_name].is_driving = drive_status;
    const button = document.getElementById('main-submit');

    // re-draw the cabins
    populate_cabins()
    button.disabled = true;
    button.textContent = 'Processing...';
    // Update the DB out-of-band.
    let is_successful = await post_person_data(is_mocked=mocking);

    if(is_successful) {
        button.textContent = 'Success!';
    } else {
        button.textContent = 'Updated Failed';
    }
    // Reset the text after 1 second.
    setTimeout(() => {
        button.textContent = 'Submit';
        button.disabled = false;
    }, 2000);
}


function ftue_setup() {
    // We got the response from the DB, now we can enable the submit button.
    document.getElementById("ftue-submit-btn").disabled = false
    document.getElementById("ftue-welcome").innerHTML = `<br>Hello ${person_name}!`
    // Disable the landing page and show the ftue.
    document.getElementById("landing").style.display = "none";
    document.getElementById("main-page").style.display = "none";
    document.getElementById("ftue").style.display = "block";
}

function landing_setup() {
    // Only add text after 3 seconds
    setTimeout(() => {
        document.getElementById("landing-text").style.display = "block"
    }, 2000);
}


async function on_start() {
    landing_setup();

    await get_person_data(is_mocked=mocking);
    build_person_mappings();

    if(!person_name) {
        // The person's ID does not match on the backend. Don't let them into the website.
    } else {
        if(person_info.rsvp_status === "Pending") {
            ftue_setup()
        } else {
            main_page_setup()
        }
    }
}

on_start()

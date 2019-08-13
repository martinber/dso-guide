import { config } from "./config.js";


// Display map with the configuration above or any subset therof
// Celestial.display(config);


function button_test() {
    const userAction = async () => {
        const response = await fetch('http://127.0.0.1:5000/api/v1/resources/location/all');
        const myJson = await response.json();

        const test_text = document.getElementById('test-text');
        test_text.innerHTML="dfjhslfd";
    }
    userAction();
}

document.getElementById("test-button").addEventListener("click", button_test);

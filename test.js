const axios = require("axios");

const AUTH_ENDPOINT = "http://20.244.56.144/evaluation-service/auth";
const NUMBER_SOURCES = {
    prime: "http://20.244.56.144/evaluation-service/primes",
    fibonacci: "http://20.244.56.144/evaluation-service/fibo",
    even: "http://20.244.56.144/evaluation-service/even",
    random: "http://20.244.56.144/evaluation-service/rand"
};

let SESSION_TOKEN = null;

const fetchAuthToken = async () => {
    try {
        console.log("Fetching authentication token...");
        const response = await axios.post(AUTH_ENDPOINT, {
            email: "22051107@kiit.ac.in",
            name: "shivam agarwal",
            rollNo: "22051107",
            accessCode: "nwpwrZ",
            clientID: "6c35546b-8e26-4866-93dd-7d3f64578372",
            clientSecret: "AzKEubMeVYZWxejf"
        }, {
            headers: { "Content-Type": "application/json" }
        });

        SESSION_TOKEN = response.data.access_token;
        console.log("Token acquired:", SESSION_TOKEN);
    } catch (error) {
        console.error("Token fetch failed:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

const testAPI = async (sourceType) => {
    if (!SESSION_TOKEN) {
        await fetchAuthToken();
    }

    try {
        console.log(`Testing API: ${sourceType}`);
        const response = await axios.get(NUMBER_SOURCES[sourceType], {
            headers: { "Authorization": `Bearer ${SESSION_TOKEN}` }
        });

        console.log(`Response from ${sourceType}:`, response.data);
    } catch (error) {
        console.error(`Error fetching ${sourceType}:`, error.response ? error.response.data : error.message);
    }
};

const runTests = async () => {
    await fetchAuthToken();

    for (const sourceType of Object.keys(NUMBER_SOURCES)) {
        await testAPI(sourceType);
    }
};

runTests();
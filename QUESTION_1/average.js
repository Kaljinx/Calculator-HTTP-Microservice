const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

const AUTH_URL = "http://20.244.56.144/evaluation-service/auth";
const API_URLS = {
    p: "http://20.244.56.144/evaluation-service/primes",
    f: "http://20.244.56.144/evaluation-service/fibo",
    e: "http://20.244.56.144/evaluation-service/even",
    r: "http://20.244.56.144/evaluation-service/rand"
};

let ACCESS_TOKEN = null;
let numberWindow = [];

const fetchNewToken = async () => {
    try {
        console.log("Fetching new access token...");

        const response = await axios.post(AUTH_URL, {
            email: "22051107@kiit.ac.in",
            name: "shivam agarwal",
            rollNo: "22051107",
            accessCode: "nwpwrZ",
            clientID: "6c35546b-8e26-4866-93dd-7d3f64578372",
            clientSecret: "AzKEubMeVYZWxejf"
        }, {
            headers: { "Content-Type": "application/json" }
        });

        ACCESS_TOKEN = response.data.access_token;
        console.log("New Access Token Acquired:", ACCESS_TOKEN);
    } catch (error) {
        console.error("Error fetching token:", error.response ? error.response.data : error.message);
    }
};

const fetchNumbers = async (numberId, retry = true) => {
    try {
        const sourceUrl = API_URLS[numberId];
        const response = await axios.get(sourceUrl, {
            headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` },
            timeout: 500
        });

        return response.data.numbers || [];
    } catch (error) {
        if (error.response && error.response.status === 401 && retry) {
            console.error("401 Unauthorized! Fetching new token and retrying...");
            await fetchNewToken();
            return fetchNumbers(numberId, false);
        }

        console.error(`Error fetching numbers from ${numberId}:`, error.message);
        return [];
    }
};

const updateWindow = (newNumbers) => {
    const prevState = [...numberWindow];

    newNumbers.forEach(num => {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= WINDOW_SIZE) {
                numberWindow.shift();
            }
            numberWindow.push(num);
        }
    });

    const avg = numberWindow.length > 0 ? 
        (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2) 
        : 0;

    return { prevState, currState: [...numberWindow], avg };
};
app.get("/numbers/:numberid", async (req, res) => {
    const { numberid } = req.params;
    if (!API_URLS[numberid]) {
        return res.status(400).json({ error: "Invalid number ID" });
    }

    const numbers = await fetchNumbers(numberid);
    const { prevState, currState, avg } = updateWindow(numbers);

    res.json({
        windowPrevState: prevState,
        windowCurrState: currState,
        numbers: numbers,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await fetchNewToken();
});

module.exports = app;

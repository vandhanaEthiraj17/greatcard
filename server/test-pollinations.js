const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testPollinations() {
    try {
        console.log("Testing Pollinations.ai connectivity...");
        const url = 'https://image.pollinations.ai/prompt/test?width=1080&height=1080&nologo=true';
        console.log(`Fetching ${url}...`);

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Data length: ${response.data.length}`);

        if (response.status === 200 && response.data.length > 0) {
            console.log("SUCCESS: Image fetched.");
            // Try saving
            const testPath = path.join(__dirname, 'test-image.jpg');
            fs.writeFileSync(testPath, response.data);
            console.log(`SUCCESS: Saved to ${testPath}`);
        } else {
            console.error("FAILED: Invalid response");
        }

    } catch (error) {
        console.error("FAILED:", error.message);
        if (error.response) {
            console.error("Response:", error.response.status, error.response.data);
        }
    }
}

testPollinations();

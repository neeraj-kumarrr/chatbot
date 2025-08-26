const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function startChat() {
    rl.question('You: ', async (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
            rl.close();
            return;
        }
        let response = await getChatbotResponse(userInput);
        console.log('Chatbot:', response);
        startChat();
    });
}

startChat();
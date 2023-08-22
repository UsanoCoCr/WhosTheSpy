async function startGame() {
    console.log("Starting game...");
    const response = await fetch('/start');
    const data = await response.json();
    console.log("Undercover is:", data.undercover); // 仅用于测试，实际游戏中不应该这样做

    const players = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
    for (let player of players) {
        const chatResponse = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerName: player })
        });

        const chatData = await chatResponse.json();
        const chatElem = document.getElementById(player.toLowerCase() + 'Chat');
        chatElem.innerHTML += `<p class="chat">${player}: ${chatData.reply}</p>`;
    }
}

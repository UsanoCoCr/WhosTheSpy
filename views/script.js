async function startGame() {
     document.getElementById("startGameButton").style.display = "none";
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
    vote();
}

async function vote() {
    const players = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
    for (let player of players) {
        const voteResponse = await fetch('/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerName: player })
        });

        const voteData = await voteResponse.json();
        const chatElem = document.getElementById(player.toLowerCase() + 'Chat');
        chatElem.innerHTML += `<p class="chat">${player} voted for: ${voteData.vote}</p>`;
    }

    // 从后端获取投票结果
    const votesResponse = await fetch('/getVotes');
    const votes = await votesResponse.json();

    // 判定胜负
    const mostVotes = Math.max(...Object.values(votes));
    const votedOut = Object.keys(votes).find(player => votes[player] === mostVotes);

    if (votedOut === undercover) {
        alert("平民胜利！");
    } else {
        alert("卧底胜利！");
    }
}
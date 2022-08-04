var sendWorker = new Worker("send.js");
var receiveWorker = new Worker("receive.js");

sendWorker.onmessage = function(msg)
{
    receiveWorker.postMessage(msg.data);
}

function sendMessage()
{
    sendWorker.postMessage("");
}
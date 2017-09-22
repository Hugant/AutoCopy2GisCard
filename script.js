if (localStorage.number == null ||
    localStorage.number == undefined ||
    localStorage.number == "") {
    localStorage.number = 0;
}

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.name) {
            case "getCard":
                console.log(JSON.parse(localStorage.card));
                sendResponse(JSON.parse(localStorage.card));
                break;

            case "setCard":
                console.log(request.value);
                request.value.number = localStorage.number;
                localStorage.card = JSON.stringify(request.value);
                break;

            case "increaseNumber":
                localStorage.number++;
                break;

            case "changeNumber":
                localStorage.number = request.value;
                break;

            case "getNumber":
                sendResponse(localStorage.number);
                break;
        }
    });

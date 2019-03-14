const API_KEY = "ltSIRvivUjymiHUW5l16l8LPoTvbolLe";
const urlHead = "//api.giphy.com/v1/gifs/search?q=";
const urlTail = "&api_key=" + API_KEY + "&limit=1";

var constructURL = query => {
  return urlHead + query + urlTail;
};

var isgif = false;

send.addEventListener("click", () => {
  if (message.value == "") {
    message.value = "<i>~nudge~</i>";
  }

  var val = message.value;
  if (val[0] == "/") {
    isgif = true;
    var prompt = val.slice(1, val.length).trim();
    var URL = constructURL(prompt);
    $.getJSON(URL, data => {
      var gifurl = data.data[0].images.original.url;
      socket.emit("chat", {
        username: handle.value,
        message: gifurl,
        isgif: true
      });
      message.value = "";
      message.focus();
      message.select();
    });
  } else {
    socket.emit("chat", {
      username: handle.value,
      message: message.value,
      isgif: false
    });
    message.value = "";
    message.focus();
    message.select();
  }
});

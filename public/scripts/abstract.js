class Abstract extends React.Component {
  uniqKey = 0;
  saveUserKey(key) {
    localStorage.setItem("mdkey", key);
    return localStorage.getItem("mdkey");
  }

  getUserKey() {
    return localStorage.getItem("mdkey");
  }

  makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  getConfig() {
    if (location.hostname == "paradoxchess.test") {
      //debug
      var config = {
        socket_port: 8888,
        socket_host: "ws://192.168.1.22:8888",
        email: "paradoxchess@gmail.com",
        static_url: "",
        dev: true,
      };
    } else {
      //production
      var config = {
        socket_port: 8888,
        socket_host: "ws://192.168.1.22:8888",
        email: "paradoxchess@gmail.com",
        static_url: "",
        dev: false,
      };
    }
    return config;
  }

  redirect(href) {
    window.location.href = href;
  }

  alert(message) {
    var div = document.createElement("div");
    div.style.cssText =
      "box-shadow:2px 2px 7px 0px black;border-radius:10px;position:absolute;top:40%;left:50%;background:red;color:white;border:solid black 1px;padding:20px;font-size:100%;";
    div.id = "message_alert";
    div.innerHTML = message;
    document.getElementsByTagName("body")[0].append(div);

    setTimeout(function () {
      document
        .getElementsByTagName("body")[0]
        .removeChild(document.getElementById("message_alert"));
    }, 3000);
  }

  uk() {
    this.uniqKey++;
    return this.uniqKey;
  }

  send2game(data) {
    document.dispatchEvent(
      new CustomEvent("send2game", {
        detail: data,
        bubbles: true,
        cancelable: false,
      })
    );
  }

  send2ui(data) {
    document.dispatchEvent(
      new CustomEvent("send2ui", {
        detail: data,
        bubbles: true,
        cancelable: false,
      })
    );
  }
}

export default Abstract;

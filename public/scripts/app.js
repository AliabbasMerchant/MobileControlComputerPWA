const testing = true;
let URL;

$(() => {
    const connectionSecret = testing ? "abcde" : Array(5).fill(0).map(_x => Math.random().toString(36).charAt(2)).join('');
    document.getElementById("secretText").value = connectionSecret;
    
    function send(signal, action) {
        console.log(signal, action)
        $.post(`${URL}/control`, { connectionSecret, signal, action })
        .done((data) => {
            data = JSON.parse(data)
            if (!data.ok) {
                console.log(`Error: Signal=${signal}, Msg=${data.msg}`)
            }
        }).fail((err) => {
            console.log("err", err);
        });
    }
    function trackpadEventHandler(event) {
        var trackpad = $('#trackpad')
        var offset = trackpad.offset();
        var x = Math.round(event.touches[0].pageX - offset.left);
        var y = Math.round(event.touches[0].pageY - offset.top);
        console.log(event.touches[0].pageX, offset.left, x, y, event.touches[0].pageY, offset.top)
        send(JSON.stringify({x, y, w: trackpad[0].offsetWidth, h:trackpad[0].offsetHeight }), 'mouse')
    }
    
    function controller() {
        $("#controllerTabs").tabs();
        $(".controlButton").click((e) => {
            let signal = $(e.target).data('signal');
            send(signal, 'type');
        });
        document.getElementById("trackpad").ontouchmove = trackpadEventHandler;
        document.getElementById("trackpad").ontouchstart = trackpadEventHandler;
        document.getElementById("textarea").oninput = (event) => {
            var inputType = event.inputType;
            if(inputType == "insertText") {
                var data = event.data;
                send(data, 'type')
            } else if(inputType == "deleteContentBackward") {
                send('backspace', 'type')
            } else if(inputType == "deleteContentForward") {
                send('delete', 'type')
            }
        };
        $(".mouseButton").click((e) => {
            let signal = $(e.target).data('signal');
            send(signal, 'click');
        });
    }

    $("#connectButton").click(() => {
        URL = testing ? "http://127.0.0.1:3124" : document.getElementById("connectInput").value;
        $.post(`${URL}/connect`, { connectionSecret })
            .done((data) => {
                data = JSON.parse(data)
                if (data.ok) {
                    $("#connector").hide();
                    $("#controller").show();
                    controller();
                } else {
                    alert(data.msg)
                }
            }).fail((err) => {
                console.log("err", err);
                alert("Sorry, an error occurred");
            });
    });
})
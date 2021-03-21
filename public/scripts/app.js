const testing = true;
let URL;
let socket;
let keysPressed = {};

$(() => {
    const connectionSecret = testing ? "abcde" : Array(5).fill(0).map(_x => Math.random().toString(36).charAt(2)).join('');
    document.getElementById("secretText").value = connectionSecret;
    
    function send(signal, action) {
        console.log("Sending signal and action:", signal, action)
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

    function trackpadClickEventHandler(event) {
        trackpadEventHandler(event.pageX, event.pageY);
    }

    function trackpadTouchEventHandler(event) {
        trackpadEventHandler(event.touches[0].pageX, event.touches[0].pageY);
    }

    function trackpadEventHandler(X, Y) {
        var trackpad = $('#trackpad')
        var offset = trackpad.offset();
        var x = Math.round(X - offset.left);
        var y = Math.round(Y - offset.top);
        console.log(X, offset.left, x, y, Y, offset.top)
        send(JSON.stringify({x, y, w: trackpad[0].offsetWidth, h:trackpad[0].offsetHeight }), 'mouse')
    }
    
    function controller() {
        $("#controllerTabs").tabs();
        $(".controlButton").click((e) => {
            let signal = $(e.target).data('signal');
            send(signal, 'type');
        });

        document.getElementById("trackpad").onclick = trackpadClickEventHandler;
        document.getElementById("trackpad").ontouchmove = trackpadTouchEventHandler;
        document.getElementById("trackpad").ontouchstart = trackpadTouchEventHandler;
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

        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
         
            if (keysPressed['Control'] && keysPressed['Alt'] && event.key == 'CapsLock') {
                URL = testing ? "http://192.168.1.106:3124" : document.getElementById("connectInput").value;
                $.post(`${URL}/shutdown`, { connectionSecret })
                    .done((data) => {
                        data = JSON.parse(data)
                        if (data.ok) {
                            alert(data.msg)
                            URL = "http://localhost:3000"
                            $.get(`${URL}/shutdown`)
                                .done((data) => {
                                    alert(data.msg)
                                }).fail((err) => {
                                    console.log("err", err);
                                    alert("Sorry, Couldn't end the session");
                                });
                        } else {
                            alert(data.msg)
                        }
                    }).fail((err) => {
                        console.log("err", err);
                        alert("Sorry, Couldn't end the session");
                    });
            }
        });
         
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        
        $("#startButton").click(() => {
            
            socket = io.connect('http://192.168.1.106:3124');
            
            socket.on('after connect', function(msg) {
                console.log(msg.data);
            });
        
            socket.emit('Start Recieving Data', 'Get the image data');

            socket.on('data', function(data) {
                new_data = data['msg']['pixels']
                var binary = '';
                var bytes = new Uint8Array(new_data);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode( bytes[ i ] );
                }
                var encoded_string = window.btoa(binary);

                console.log('Received: ' + encoded_string);
                document.getElementById('image')
                .setAttribute(
                    'src', 'data:image/png;base64,' + encoded_string
                );
            });
        });

        $("#endButton").click(() => {
            socket.emit('Close connection', 'Closing the connection from client side')
            socket.close()
            console.log("Ended")
            document.getElementById('image').setAttribute(
                'src', ''
            );
        });

        $(".mouseButton").click((e) => {
            let signal = $(e.target).data('signal');
            send(signal, 'click');
        });
    }

    $("#connectButton").click(() => {
        URL = testing ? "http://192.168.1.106:3124" : document.getElementById("connectInput").value;
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
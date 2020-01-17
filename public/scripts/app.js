const testing = true;
let URL;

$(() => {
    function controller() {
        $("#controllerTabs").tabs();
        $(".controlButton").click((e) => {
            let signal = $(e.target).data('signal');
            $.post(`${URL}/control`, { connectionSecret, signal })
                .done((data) => {
                    data = JSON.parse(data)
                    if (!data.ok) {
                        console.log(`Error: Signal=${signal}, Msg=${data.msg}`)
                    }
                }).fail((err) => {
                    console.log("err", err);
                });
        });
        document.getElementById("trackpad").ontouchmove = (event) => {
            var x = event.touches[0].clientX;
            var y = event.touches[0].clientY;
            console.log(x, y)
        };
        document.getElementById("trackpad").ontouchstart = (event) => {
            console.log("start")
        };
        document.getElementById("trackpad").ontouchend = (event) => {
            console.log("end")
        };
    }

    const connectionSecret = testing ? "abcde" : Array(5).fill(0).map(_x => Math.random().toString(36).charAt(2)).join('');
    document.getElementById("secretText").value = connectionSecret;
    $("#connectButton").click(() => {
        // URL = testing ? "http://127.0.0.1:3124" : document.getElementById("connectInput").value;
        URL = testing ? "http://192.168.43.199:3124" : document.getElementById("connectInput").value;
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
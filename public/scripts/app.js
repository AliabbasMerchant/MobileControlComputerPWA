const testing = true;

$(() => {
    $("#controller").hide();
    const connectionSecret = testing ? "abcde" : Array(5).fill(0).map(_x => Math.random().toString(36).charAt(2)).join('');
    document.getElementById("secretText").value = connectionSecret;
    $("#connectButton").click(() => {
        let url = testing ? "http://127.0.0.1:3124" : document.getElementById("connectInput").value;
        $.post(`${url}/connect`, { connectionSecret })
            .done((data) => {
                data = JSON.parse(data)
                if(data.ok) {
                    $("#connector").hide();
                    $("#controller").show();
                } else {
                    alert(data.msg)
                }
            }).fail((err) => {
                console.log("err", err);
                alert("Sorry, an error occurred");
            });
    });
})
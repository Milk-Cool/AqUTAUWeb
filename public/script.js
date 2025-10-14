const genJSON = () => {
    const json = {
        name: document.querySelector("#name").value,
        bas: parseInt(document.querySelector("#bas").value)
    };
    for(const key of ["spd", "vol", "pit", "acc", "lmd", "fsc"]) {
        const val = document.getElementById(key).valueAsNumber;
        json[key] = val;
    }
    return json;
};

document.querySelector("#generate").addEventListener("click", async () => {
    const json = genJSON();
    console.log(json);
    document.querySelector("#loading").style.display = "unset";
    const f = await fetch("/", {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            "content-type": "application/json"
        }
    });
    if(f.status !== 200) {
        alert(await f.text());
        document.querySelector("#loading").style.display = "";
        return;
    }
    const blob = await f.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = json.name + ".zip";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    document.querySelector("#loading").style.display = "";
});
document.querySelector("#preview").addEventListener("click", async () => {
    const json = genJSON();
    console.log(json);
    const f = await fetch("/sample", {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            "content-type": "application/json"
        }
    });
    if(f.status !== 200) {
        alert(await f.text());
        document.querySelector("#loading").style.display = "";
        return;
    }
    const blob = await f.blob();
    const url = URL.createObjectURL(blob);
    document.querySelector("#audio").src = url;
    document.querySelector("#audio").onload = () => URL.revokeObjectURL(url);
});
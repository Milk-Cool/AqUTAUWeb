import "dotenv/config";
import express from "express";
import AqUTAU from "aqutau";
import { rateLimit } from "express-rate-limit";

const aqutau = new AqUTAU(process.env.AQ10_PATH, process.env.DEV_KEY, process.env.USR_KEY);

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.post("/", rateLimit({
    windowMs: 3 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: true,
    ipv6Subnet: 56
}), async (req, res) => {
    // TODO: make this prettier
    if(typeof req.body.name !== "string" || !req.body.name || req.body.name.length > 100) return res.status(400).send("Invalid name!");
    if(typeof req.body.bas !== "number" || req.body.bas < 0 || req.body.bas > 2) return res.status(400).send("Invalid bas!");
    req.body.bas = Math.floor(req.body.bas);
    if(typeof req.body.spd !== "number" || req.body.spd < 50 || req.body.spd > 200) return res.status(400).send("Invalid spd!");
    req.body.spd = Math.floor(req.body.spd);
    if(typeof req.body.vol !== "number" || req.body.vol < 0 || req.body.vol > 300) return res.status(400).send("Invalid vol!");
    req.body.vol = Math.floor(req.body.vol);
    if(typeof req.body.pit !== "number" || req.body.pit < 20 || req.body.pit > 200) return res.status(400).send("Invalid pit!");
    req.body.pit = Math.floor(req.body.pit);
    if(typeof req.body.acc !== "number" || req.body.acc < 0 || req.body.acc > 200) return res.status(400).send("Invalid acc!");
    req.body.acc = Math.floor(req.body.acc);
    if(typeof req.body.lmd !== "number" || req.body.lmd < 0 || req.body.lmd > 200) return res.status(400).send("Invalid lmd!");
    req.body.lmd = Math.floor(req.body.lmd);
    if(typeof req.body.fsc !== "number" || req.body.fsc < 50 || req.body.fsc > 200) return res.status(400).send("Invalid fsc!");
    req.body.fsc = Math.floor(req.body.fsc);

    res.header("content-disposition", "attachment; filename=\"" + req.body.name + ".zip\"").send(await aqutau.generateVoicebankZIP({
        bas: req.body.bas,
        spd: req.body.spd,
        vol: req.body.vol,
        pit: req.body.pit,
        acc: req.body.acc,
        lmd: req.body.lmd,
        fsc: req.body.fsc
    }, req.body.name));
});

app.listen(7077);
import "dotenv/config";
import express from "express";
import AqUTAU from "aqutau";
import { rateLimit } from "express-rate-limit";

const aqutau = new AqUTAU(process.env.AQ10_PATH, process.env.DEV_KEY, process.env.USR_KEY);

const invalidNumber = (req, min, max, res, name) => {
    if(typeof req.body[name] !== "number" || req.body[name] < min || req.body[name] > max) {
        res.status(400).send("Invalid " + name + "!");
        return false;
    }
    return Math.floor(req.body[name]);
};

const validMiddleware = nameRequired => (req, res, next) => {
    if(nameRequired && (typeof req.body.name !== "string" || !req.body.name || req.body.name.length > 100)) return res.status(400).send("Invalid name!");
    req.body.bas = invalidNumber(req, 0, 2, res, "bas");
    if(req.body.bas === false) return;
    req.body.spd = invalidNumber(req, 50, 200, res, "spd");
    if(req.body.spd === false) return;
    req.body.vol = invalidNumber(req, 0, 300, res, "vol");
    if(req.body.vol === false) return;
    req.body.pit = invalidNumber(req, 20, 200, res, "pit");
    if(req.body.pit === false) return;
    req.body.acc = invalidNumber(req, 0, 200, res, "acc");
    if(req.body.acc === false) return;
    req.body.lmd = invalidNumber(req, 0, 200, res, "lmd");
    if(req.body.lmd === false) return;
    req.body.fsc = invalidNumber(req, 50, 200, res, "fsc");
    if(req.body.fsc === false) return;

    next();
};

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.post("/", rateLimit({
    windowMs: 3 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: true,
    ipv6Subnet: 56
}), validMiddleware(true), async (req, res) => {
    res.header("content-type", "application/zip").header("content-disposition", "attachment; filename=\"" + req.body.name + ".zip\"").send(await aqutau.generateVoicebankZIP({
        bas: req.body.bas,
        spd: req.body.spd,
        vol: req.body.vol,
        pit: req.body.pit,
        acc: req.body.acc,
        lmd: req.body.lmd,
        fsc: req.body.fsc
    }, req.body.name));
});
app.post("/sample", rateLimit({
    windowMs: 3 * 60 * 1000,
    limit: 15,
    standardHeaders: "draft-8",
    legacyHeaders: true,
    ipv6Subnet: 56
}), validMiddleware(false), (req, res) => {
    res.header("content-type", "audio/wav").header("content-disposition", "attachment; filename=\"sample.wav\"").send(aqutau.generateSound("ありがとうございます", {
        bas: req.body.bas,
        spd: req.body.spd,
        vol: req.body.vol,
        pit: req.body.pit,
        acc: req.body.acc,
        lmd: req.body.lmd,
        fsc: req.body.fsc
    }));
});

app.listen(process.env.PORT ? parseInt(process.env.PORT) : 7077);
const net = require("net");
const tls = require("tls");
const Duplex = require("stream").Duplex;

class Rendezvous extends Duplex { //extends Duplex {
    constructor(rv) {
        super();

        this.rv = rv instanceof URL ? rv : new URL(rv);
        if (this.rv.protocol !== "rendezvous:") {
            throw new Error("Invalid protocol");
        }

        this.connected = false;
        this.socket = null;
    }

    connect(timeout) {
        timeout = timeout || 15000;
        return new Promise((resolve, reject) => {
            let timer = setTimeout(() => reject("Timed out."), timeout);

            this.socket = tls.connect(this.rv.port, this.rv.hostname, () => {
                this.socket.once("data", (d) => {
                    d = d.toString().trim();
                    if (d === "rendezvous") {
                        clearTimeout(timer);
                        this.connected = true;
                        resolve(this);
                        this.emit("rendezvous");

                        this.socket.on("data", (d) => this._handleData(d));
                    }
                });
                this.socket.write(this.rv.pathname.substr(1), (err) => {
                    if (err) reject(err);
                });
            });
        });
    }

    _handleData(data) {
        if (this.connected) this.push(data);
    }

    _read() {}
    _write(chunk, encoding, callback) {
        if (this.connected) {
            this.socket.write(chunk, encoding, callback);
        }
    }
}

module.exports = Rendezvous;
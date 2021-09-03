const Rendezvous = require('./rendezvous');

if (require.main === module) {
    if (!process.stdin.isTTY) throw new Error('stdin must be a TTY');
    if (process.argv.length < 3) throw new Error('Usage: rendezvous <host>'); // TODO: add a better error message

    const rv = new Rendezvous(process.argv[2]);

    process.on("exit", (e) => {
        rv.end();
    });

    rv.on("rendezvous", () => {
        process.stdout.write('Rendezvous established.\n');

        // data came from the server
        rv.on('data', data => {
            process.stdout.write(data);
        });

        // send data to the server
        process.stdin.on('data', data => {
            rv.write(data);
        });
    });

    rv.on("error", err => {
        console.error(err);
        process.exit(1);
    });
    
    rv.connect();
} else {
    module.exports = Rendezvous;
}

// You're in the middle of trying to send and receive data to/from the rendezvous server..
// In rv.js you need to use this.emit('data', data) to pump the data back to the console.
// Then in rv.js as well, you need to pump the data from `write` to the server.
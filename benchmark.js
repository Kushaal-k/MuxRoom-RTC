const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockCreatePeerConnection = async (id) => {
    await simulateDelay(10); // simulate some work
    return {
        createOffer: async () => {
            await simulateDelay(5);
            return { type: 'offer', sdp: 'fake-sdp' };
        },
        setLocalDescription: async (offer) => {
            await simulateDelay(5);
        }
    };
};

const mockSocket = {
    emit: (event, data) => {}
};

const users = Array.from({ length: 50 }).map((_, i) => ({ socketId: `user-${i}` }));

async function runSequential() {
    const start = performance.now();
    for (const { socketId } of users) {
        const pc = await mockCreatePeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        mockSocket.emit("offer", { target: socketId, sdp: offer });
    }
    const end = performance.now();
    return end - start;
}

async function runParallel() {
    const start = performance.now();
    await Promise.all(users.map(async ({ socketId }) => {
        const pc = await mockCreatePeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        mockSocket.emit("offer", { target: socketId, sdp: offer });
    }));
    const end = performance.now();
    return end - start;
}

async function main() {
    console.log("Running baseline (sequential)...");
    const seqTime = await runSequential();
    console.log(`Baseline time: ${seqTime.toFixed(2)}ms`);

    console.log("Running optimized (parallel)...");
    const parTime = await runParallel();
    console.log(`Optimized time: ${parTime.toFixed(2)}ms`);

    console.log(`Improvement: ${((seqTime - parTime) / seqTime * 100).toFixed(2)}% faster`);
}

main();

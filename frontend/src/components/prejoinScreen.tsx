import React from "react";

const PrejoinScreen = () => {
    const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const initConnection = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,    
            });
            setLocalStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    };

    React.useEffect(() => {
        initConnection();
    }, []);

    return (
        <>
            <h1>Join Meeting</h1>
            <div className="flex flex-col gap-2">
                <h2>Preview</h2>
                <div>
                    <video autoPlay muted playsInline ref={videoRef}/>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="name">Name</label>
                <input type="text" placeholder="Enter Name" />
                <label htmlFor="meetingId">Meeting ID</label>
                <input type="text" placeholder="Enter Meeting ID" />

                <button>Join</button>
            </div>
        </>
    );
};

export default PrejoinScreen;
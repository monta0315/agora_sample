import AgoraRTC, {
  IAgoraRTCClient,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

const options = {
  // Pass your App ID here.
  appId: 'Your App ID',
  // Set the channel name.
  channel: 'test',
  // Pass your temp token here.
  token: 'Your temp token',
  // Set the user ID.
  uid: 123456,
};

const BasicVideoCall = () => {
  const client: IAgoraRTCClient = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
  });

  // Create an AgoraRTCClient object.

  // Listen for the "user-published" event, from which you can get an AgoraRTCRemoteUser object.
  client.on('user-published', (user, mediaType) => {
    // Subscribe to the remote user when the SDK triggers the "user-published" event
    client
      .subscribe(user, mediaType)
      .then((result) => {
        console.log(result);
        console.log('subscribe success');
      })
      .catch((err) => {
        console.log(err);
      });

    // If the remote user publishes a video track.
    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack;

      const remotePlayerContainer = document.createElement('div');
      remotePlayerContainer.id = user.uid.toString();
      remotePlayerContainer.textContent = `Remote user ${user.uid.toString()}`;
      remotePlayerContainer.style.width = '640px';
      remotePlayerContainer.style.height = '480px';
      document.body.append(remotePlayerContainer);

      // Play the remote video track.
      // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
      (remoteVideoTrack as IRemoteVideoTrack).play(remotePlayerContainer);

      // Or just pass the ID of the DIV container.
      // remoteVideoTrack.play(playerContainer.id);
    }

    // If the remote user publishes an audio track.
    if (mediaType === 'audio') {
      // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
      const remoteAudioTrack = user.audioTrack;
      // Play the remote audio track. No need to pass any DOM element.
      (remoteAudioTrack as IRemoteAudioTrack).play();
    }

    // Listen for the "user-unpublished" event
    client.on('user-unpublished', (unpublishUser) => {
      // Get the dynamically created DIV container.
      const remotePlayerContainer = document.getElementById(
        String(unpublishUser.uid)
      );
      // Destroy the container.
      (remotePlayerContainer as HTMLElement).remove();
    });
  });

  window.onload = function () {
    let localAudioTrack: IMicrophoneAudioTrack;
    let localVideoTrack: ICameraVideoTrack;
    (document.getElementById('join') as HTMLElement).onclick =
      async function () {
        // Join an RTC channel.
        await client.join(
          options.appId,
          options.channel,
          options.token,
          options.uid
        );
        // Create a local audio track from the audio sampled by a microphone.
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        // Create a local video track from the video captured by a camera.
        localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        // Publish the local audio and video tracks to the RTC channel.
        await client.publish([localAudioTrack, localVideoTrack]);
        // Dynamically create a container in the form of a DIV element for playing the local video track.
        const localPlayerContainer = document.createElement('div');
        // Specify the ID of the DIV container. You can use the uid of the local user.
        localPlayerContainer.id = String(options.uid);
        localPlayerContainer.textContent = `Local user ${options.uid}`;
        localPlayerContainer.style.width = '640px';
        localPlayerContainer.style.height = '480px';
        document.body.append(localPlayerContainer);

        // Play the local video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the local video track.
        localVideoTrack.play(localPlayerContainer);
        console.log('publish success!');
      };

    (document.getElementById('leave') as HTMLElement).onclick =
      async function () {
        // Destroy the local audio and video tracks.
        localAudioTrack.close();
        localVideoTrack.close();

        // Traverse all remote users.
        client.remoteUsers.forEach((user) => {
          // Destroy the dynamically created DIV containers.
          const playerContainer = document.getElementById(String(user.uid));
          (playerContainer as HTMLElement).remove();
        });

        // Leave the channel.
        await client.leave();
      };
  };
};

export default BasicVideoCall;

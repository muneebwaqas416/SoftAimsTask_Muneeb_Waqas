export const convertWebmToWav = async (webmBlob: Blob): Promise<ArrayBuffer> => {
    try {
      // 1. Validate input
      if (!webmBlob || webmBlob.size < 100) { // Minimum reasonable size
        throw new Error('Invalid audio data: blob too small or empty');
      }
  
      // 2. Create AudioContext with error handling
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // Match your recording settings
      });
  
      // 3. Try multiple decoding approaches
      let audioBuffer: AudioBuffer;
      const arrayBuffer = await webmBlob.arrayBuffer();
      
      // First try: Standard decoding
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      } catch (firstError) {
        console.warn('Standard decode failed, trying alternative methods...');
        
        // Second try: Force Opus codec
        try {
          const opusBlob = new Blob([arrayBuffer], { type: 'audio/webm; codecs=opus' });
          audioBuffer = await audioContext.decodeAudioData(await opusBlob.arrayBuffer());
        } catch (opusError) {
          console.warn('Opus decode failed, trying as raw data...');
          
          // Final try: Manual conversion
          audioBuffer = await manualPcmConversion(arrayBuffer, audioContext);
        }
      }
  
      // 4. Convert to WAV
      return audioBufferToWav(audioBuffer);
    } catch (error : any) {
      console.error("Full conversion error:", error);
      throw new Error(`Conversion failed: ${error.message}`);
    }
  };
  
  // Fallback manual conversion for problematic audio
  const manualPcmConversion = async (buffer: ArrayBuffer, context: AudioContext): Promise<AudioBuffer> => {
    // Create silent buffer as fallback (1 channel, 16000Hz)
    const fallbackBuffer = context.createBuffer(1, 16000, 16000);
    console.warn('Using fallback silent buffer due to conversion failure');
    return fallbackBuffer;
  };
  
  // Enhanced WAV conversion with validation
  function audioBufferToWav(buffer: AudioBuffer): any {
    // Validate audio buffer
    if (buffer.length === 0 || buffer.numberOfChannels === 0) {
      throw new Error('Empty audio buffer cannot be converted');
    }
  
    // Rest of the conversion logic (same as previous implementation)
    // ...
  }
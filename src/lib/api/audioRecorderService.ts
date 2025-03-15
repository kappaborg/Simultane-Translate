/**
 * A service for recording audio from the user's microphone
 */
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private onDataAvailableCallback: ((data: Blob) => void) | null = null;
  private onStopCallback: ((finalBlob: Blob) => void) | null = null;
  private isRecording = false;

  /**
   * Start recording audio
   * @param onDataAvailable Callback for real-time data chunks
   * @param onStop Callback for when recording stops
   * @returns Promise that resolves when recording has started
   */
  async startRecording(
    onDataAvailable?: (data: Blob) => void,
    onStop?: (finalBlob: Blob) => void
  ): Promise<void> {
    if (this.isRecording) {
      return;
    }

    this.onDataAvailableCallback = onDataAvailable || null;
    this.onStopCallback = onStop || null;
    this.audioChunks = [];

    try {
      // Request access to microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      // Set up data handling
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          if (this.onDataAvailableCallback) {
            this.onDataAvailableCallback(event.data);
          }
        }
      };
      
      // Set up stop handling
      this.mediaRecorder.onstop = () => {
        // Combine all audio chunks into single blob
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Release microphone
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        if (this.onStopCallback) {
          this.onStopCallback(audioBlob);
        }
        
        this.isRecording = false;
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw new Error('Could not start audio recording');
    }
  }

  /**
   * Stop the current recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      // Stream is released in the onstop event handler
    }
  }

  /**
   * Pause the current recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume a paused recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Check if recording is currently active
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get the current recording state
   */
  getRecordingState(): 'inactive' | 'recording' | 'paused' {
    if (!this.mediaRecorder) {
      return 'inactive';
    }
    return this.mediaRecorder.state as 'inactive' | 'recording' | 'paused';
  }
} 
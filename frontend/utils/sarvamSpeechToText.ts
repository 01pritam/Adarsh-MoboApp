// // utils/sarvamSpeechToText.ts

// const SARVAM_API_KEY = 'b480bdc8-df33-49b3-a544-a1030dc517a9';
// const SARVAM_API_URL = 'https://api.sarvam.ai/speech-to-text';

// export interface TranscriptionOptions {
//   languageCode?: string;
//   format?: string;
//   sampleRate?: number;
// }

// export interface TranscriptionResult {
//   transcript: string;
//   confidence?: number;
//   error?: string;
// }

// export async function transcribeAudio(
//   audioUri: string,
//   options: TranscriptionOptions = {}
// ): Promise<TranscriptionResult> {
//   try {
//     const {
//       languageCode = 'hi-IN',
//       format = 'wav', // or 'm4a' if that's your file format
//       sampleRate = 44100,
//     } = options;

//     // Prepare FormData for file upload
//     const formData = new FormData();
//     formData.append('file', {
//       uri: audioUri,
//       name: `audio.${format}`,
//       type: `audio/${format}`,
//     } as any);
//     formData.append('model', 'saarika:v1');
//     formData.append('language_code', languageCode);
//     formData.append('with_timestamps', 'false');
//     formData.append('with_diarization', 'false');

//     const response = await fetch(SARVAM_API_URL, {
//       method: 'POST',
//       headers: {
//         'api-subscription-key': SARVAM_API_KEY,
//         // Do NOT set 'Content-Type'; let fetch handle it for FormData
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();

//     if (result.transcript) {
//       return {
//         transcript: result.transcript,
//         confidence: result.confidence || undefined,
//       };
//     } else {
//       return {
//         transcript: '',
//         error: 'No transcription received from API',
//       };
//     }
//   } catch (error) {
//     console.error('Transcription error:', error);
//     return {
//       transcript: '',
//       error: error instanceof Error ? error.message : 'Unknown transcription error',
//     };
//   }
// }








import * as FileSystem from 'expo-file-system';

const SARVAM_API_URL = 'https://api.sarvam.ai/speech-to-text';

export interface TranscriptionOptions {
  languageCode?: string;
  format?: string;
  sampleRate?: number;
  model?: string;
}

export interface TranscriptionResult {
  transcript: string;
  confidence?: number;
  error?: string;
}

export async function transcribeAudio(
  audioUri: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    const {
      languageCode = 'en-IN',
      format = 'm4a',
      sampleRate = 44100,
      model = 'saarika:v2', // ✅ default to latest model
    } = options;

    console.log('🎙 Audio URI:', audioUri);

    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    console.log('📄 File Info:', fileInfo);

    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist at the specified URI');
    }

    const fileName = audioUri.split('/').pop() || `audio.${format}`;
    const fileType = `audio/${format}`;

    const formData: FormData = new FormData();
    formData.append('file', {
      uri: audioUri,
      name: fileName,
      type: fileType,
    } as any);
    formData.append('model', model);
    formData.append('language_code', languageCode);
    formData.append('with_timestamps', 'false');
    formData.append('with_diarization', 'false');

    console.log('📤 Sending to Sarvam.ai...');

    const response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': 'd899c911-9663-42fd-b003-9fa0dd4cf5ab',
      },
      body: formData,
    });

    const rawResponse = await response.text();
    console.log('📩 Raw response:', rawResponse);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} | ${rawResponse}`);
    }

    const result = JSON.parse(rawResponse);
    console.log('✅ Parsed Response:', result);

    if (result.transcript) {
      return {
        transcript: result.transcript,
        confidence: result.confidence || undefined,
      };
    } else {
      return {
        transcript: '',
        error: 'No transcription received from API',
      };
    }
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return {
      transcript: '',
      error: error instanceof Error ? error.message : 'Unknown transcription error',
    };
  }
}


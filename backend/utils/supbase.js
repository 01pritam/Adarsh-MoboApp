// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Dynamically resolve .env path
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// // Ensure Supabase env vars are loaded
// if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
//   console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
//   process.exit(1);
// }

// // Initialize Supabase
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_ANON_KEY
// );

// // Upload audio file to Supabase storage and return public URL
// export const storeAudioFile = async (messageId, audioFilePath) => {
//   try {
//     if (!audioFilePath || !fs.existsSync(audioFilePath)) {
//       throw new Error(`❌ Audio file not found at path: ${audioFilePath}`);
//     }

//     const bucketName = 'audio-files';
//     const fileName = `speech-${messageId}-${Date.now()}.mp3`;

//     console.log(`📤 Uploading audio file for message ${messageId}...`);

//     const fileBuffer = fs.readFileSync(audioFilePath);

//     const { error: uploadError } = await supabase.storage
//       .from(bucketName)
//       .upload(fileName, fileBuffer, {
//         cacheControl: '3600',
//         upsert: true,
//         contentType: 'audio/mpeg',
//       });

//     if (uploadError) {
//       if (uploadError.message.includes("already exists")) {
//         console.warn("⚠️ Audio file already exists, continuing...");
//       } else if (uploadError.message.includes("row-level security")) {
//         console.error("🚫 RLS Error: Supabase storage policy blocks this upload.");
//         console.error("➡️ Fix this in Supabase Dashboard > Storage > audio-files > Policies");
//       }
//       throw uploadError;
//     }

//     const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
//     if (!data?.publicUrl) {
//       throw new Error('❌ Could not retrieve public URL from Supabase');
//     }

//     console.log(`✅ Audio file uploaded for message ${messageId}`);
//     console.log('🌐 Audio URL:', data.publicUrl);
    
//     // Clean up local file after upload
//     try {
//       fs.unlinkSync(audioFilePath);
//       console.log('🗑️ Local audio file cleaned up');
//     } catch (cleanupError) {
//       console.warn('⚠️ Could not clean up local file:', cleanupError.message);
//     }
    
//     return data.publicUrl;
//   } catch (error) {
//     console.error('❌ Audio upload failed:', error.message);
//     throw error;
//   }
// };

// export default supabase;



import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Dynamically resolve .env path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Ensure Supabase env vars are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ Updated function to handle both buffers and file paths
export const storeAudioFile = async (audioData, fileName, contentType = 'audio/wav') => {
  try {
    const bucketName = 'audio-files';
    const uniqueFileName = `${Date.now()}_${fileName}`;

    console.log(`📤 Uploading audio file: ${uniqueFileName}...`);

    let fileBuffer;
    
    // ✅ Handle both Buffer and file path inputs
    if (Buffer.isBuffer(audioData)) {
      fileBuffer = audioData;
      console.log('📦 Using provided audio buffer');
    } else if (typeof audioData === 'string') {
      // Legacy support for file paths
      const fs = await import('fs');
      if (!fs.existsSync(audioData)) {
        throw new Error(`❌ Audio file not found at path: ${audioData}`);
      }
      fileBuffer = fs.readFileSync(audioData);
      console.log('📁 Read audio file from path');
    } else {
      throw new Error('❌ Invalid audio data type. Expected Buffer or file path.');
    }

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, fileBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType,
      });

    if (uploadError) {
      if (uploadError.message.includes("already exists")) {
        console.warn("⚠️ Audio file already exists, continuing...");
      } else if (uploadError.message.includes("row-level security")) {
        console.error("🚫 RLS Error: Supabase storage policy blocks this upload.");
        console.error("➡️ Fix this in Supabase Dashboard > Storage > audio-files > Policies");
      }
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(uniqueFileName);
    if (!data?.publicUrl) {
      throw new Error('❌ Could not retrieve public URL from Supabase');
    }

    console.log(`✅ Audio file uploaded successfully`);
    console.log('🌐 Audio URL:', data.publicUrl);
    
    return data.publicUrl;
  } catch (error) {
    console.error('❌ Audio upload failed:', error.message);
    throw error;
  }
};

export default supabase;

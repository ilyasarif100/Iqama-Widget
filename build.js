/**
 * Build System
 * Bundles the modular code into a single distributable file
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

async function buildWidget() {
    console.log('🔨 Building Iqama Widget...');
    
    try {
        const result = await build({
            entryPoints: ['src/main.js'],
            bundle: true,
            format: 'iife',
            globalName: 'IqamaWidget',
            outfile: 'dist/iqama-widget-cloud.js',
            minify: !isWatch,
            sourcemap: isWatch,
            target: 'es2015',
            define: {
                'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
            },
            banner: {
                js: `/*
 * Iqama Widget v2.0.0 - Modular Prayer Times Widget
 * https://github.com/ilyasarif100/Iqama-Widget
 * 
 * Super simple embed - just paste one script tag!
 * Automatically extracts Sheet ID from Google Sheet URL
 * 
 * Built: ${new Date().toISOString()}
 */`
            }
        });

        if (result.errors.length > 0) {
            console.error('❌ Build errors:', result.errors);
            process.exit(1);
        }

        if (result.warnings.length > 0) {
            console.warn('⚠️ Build warnings:', result.warnings);
        }

        console.log('✅ Build completed successfully!');
        console.log('📦 Output: dist/iqama-widget-cloud.js');
        
        // Generate file size info
        const outputFile = 'dist/iqama-widget-cloud.js';
        const stats = readFileSync(outputFile, 'utf8');
        const sizeKB = (stats.length / 1024).toFixed(2);
        console.log(`📊 File size: ${sizeKB} KB`);

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

// Run build
if (isWatch) {
    console.log('👀 Watching for changes...');
    buildWidget().then(() => {
        console.log('🔄 Watching for changes...');
    });
} else {
    buildWidget();
}

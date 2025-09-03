#!/usr/bin/env node

/**
 * Pre-build validation script
 * Checks for common issues before building for production
 */

const fs = require('fs')
const path = require('path')

const errors = []
const warnings = []

// Check environment variables
function checkEnvironment() {
    const requiredEnvVars = [
        'NEXT_PUBLIC_GROFAST_API_URL'
    ]

    const envFile = path.join(process.cwd(), '.env.local')
    const envExampleFile = path.join(process.cwd(), '.env.example')

    if (!fs.existsSync(envFile)) {
        warnings.push('No .env.local file found. Make sure environment variables are set.')
    }

    if (!fs.existsSync(envExampleFile)) {
        warnings.push('No .env.example file found for reference.')
    }

    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            errors.push(`Missing required environment variable: ${envVar}`)
        }
    })
}

// Check for console.log statements
function checkConsoleStatements() {
    const srcDirs = ['app', 'components', 'lib', 'hooks']

    srcDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            checkDirectoryForConsole(dir)
        }
    })
}

function checkDirectoryForConsole(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    files.forEach(file => {
        const fullPath = path.join(dir, file.name)

        if (file.isDirectory()) {
            checkDirectoryForConsole(fullPath)
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8')

            // Skip logger.ts file
            if (file.name === 'logger.ts') return

            const consoleMatches = content.match(/console\.(log|warn|info|debug)\(/g)
            if (consoleMatches) {
                warnings.push(`Found console statements in ${fullPath}: ${consoleMatches.join(', ')}`)
            }
        }
    })
}

// Check TypeScript configuration
function checkTypeScript() {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')

    if (!fs.existsSync(tsconfigPath)) {
        errors.push('No tsconfig.json found')
        return
    }

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))

    if (tsconfig.compilerOptions?.strict !== true) {
        warnings.push('TypeScript strict mode is not enabled')
    }
}

// Check Next.js configuration
function checkNextConfig() {
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')

    if (!fs.existsSync(nextConfigPath)) {
        warnings.push('No next.config.mjs found')
        return
    }

    const content = fs.readFileSync(nextConfigPath, 'utf8')

    if (content.includes('ignoreDuringBuilds: true')) {
        errors.push('ESLint is ignored during builds - this should be false for production')
    }

    if (content.includes('ignoreBuildErrors: true')) {
        errors.push('TypeScript errors are ignored during builds - this should be false for production')
    }
}

// Check for security issues
function checkSecurity() {
    const srcDirs = ['app', 'components', 'lib', 'hooks']

    srcDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            checkDirectoryForSecurity(dir)
        }
    })
}

function checkDirectoryForSecurity(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    files.forEach(file => {
        const fullPath = path.join(dir, file.name)

        if (file.isDirectory()) {
            checkDirectoryForSecurity(fullPath)
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8')

            // Skip security-related files
            if (file.name.includes('secure-storage') || file.name.includes('auth-security')) return

            // Check for insecure localStorage usage
            const localStorageMatches = content.match(/localStorage\.(setItem|getItem)/g)
            if (localStorageMatches && !content.includes('// @security-exception')) {
                warnings.push(`Found localStorage usage in ${fullPath}. Consider using secure storage.`)
            }

            // Check for dangerouslySetInnerHTML
            const dangerousHTML = content.match(/dangerouslySetInnerHTML/g)
            if (dangerousHTML && !content.includes('// @security-exception')) {
                warnings.push(`Found dangerouslySetInnerHTML in ${fullPath}. Ensure content is sanitized.`)
            }

            // Check for eval usage
            const evalUsage = content.match(/\beval\s*\(/g)
            if (evalUsage) {
                errors.push(`Found eval() usage in ${fullPath}. This is a security risk.`)
            }
        }
    })
}

// Run all checks
console.log('🔍 Running pre-build checks...\n')

checkEnvironment()
checkConsoleStatements()
checkSecurity()
checkTypeScript()
checkNextConfig()

// Report results
if (errors.length > 0) {
    console.log('❌ Build Check Failed\n')
    console.log('Errors:')
    errors.forEach(error => console.log(`  • ${error}`))
    console.log('')
}

if (warnings.length > 0) {
    console.log('⚠️  Warnings:')
    warnings.forEach(warning => console.log(`  • ${warning}`))
    console.log('')
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Ready for production build.')
} else if (errors.length === 0) {
    console.log('✅ Build checks passed with warnings.')
} else {
    console.log('❌ Build checks failed. Please fix the errors above.')
    process.exit(1)
}
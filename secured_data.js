'use strict'

const LEAVE_WHAT = 'leave-what'
const OBTAIN_KEY = 'obtain-key'
const PROMPT_URL = '/prompt'
const LEAVE_URL = '/leave'
const MAIN_URL = '/'

let _secured = {}

function securedData(variableName, plainDataIndex, encryptedData) {
    function encrypt(json_data, key) {
        return CryptoJS.AES.encrypt(JSON.stringify(json_data), key).toString()
    }

    function decrypt(encrypted_data, key) {
        try {
            return JSON.parse(CryptoJS.AES.decrypt(encrypted_data, key).toString(CryptoJS.enc.Utf8))
        } catch(err) {
            return null
        }
    }

    function get() {
        if (sessionStorage.getItem(plainDataIndex) !== null) {
            return JSON.parse(sessionStorage.getItem(plainDataIndex))
        } else if(localStorage.getItem(plainDataIndex) !== null) {
            return JSON.parse(localStorage.getItem(plainDataIndex))
        } else {
            return null
        }
    }

    function obtainData(key) {
        const plain = get()
        if (plain) {
            return JSON.stringify(plain)
        } else {
            const decrypted = decrypt(encryptedData, key)
            if (decrypted) {
                return JSON.stringify(decrypted)
            }
        }
        return null
    }

    const api = {
        promptForKey: function (action, prompt, url) {
            sessionStorage.setItem(OBTAIN_KEY, JSON.stringify({
                variable: variableName,
                action: action,
                prompt: prompt,
                url: url
            }))
            window.location.href = PROMPT_URL
        },
        get: get,
        encrypt: encrypt,
        unlock: function (key, permanently = false) {
            const data = obtainData(key)
            if (data) {
                if (permanently) {
                    localStorage.setItem(plainDataIndex, data)
                } else {
                    sessionStorage.setItem(plainDataIndex, data)
                }
            }
        },
        unlockPermanently: function (key) {
            const data = obtainData(key)
            if (data) {

            }
        },
        lock: function () {
            sessionStorage.removeItem(plainDataIndex)
            localStorage.removeItem(plainDataIndex)
        },
        isLocked: function () {
            return sessionStorage.getItem(plainDataIndex) === null && localStorage.getItem(plainDataIndex) === null
        },
        setForLeaving: function () {
            sessionStorage.setItem(LEAVE_WHAT, variableName)
        }
    }

    _secured[variableName] = api
    return api
}

function getPrompt() {
    try {
        const prompter = JSON.parse(sessionStorage.getItem(OBTAIN_KEY))
        return prompter.prompt
    } catch (err) {
        console.log(err)
    }
}

function obtainKey(key, permanently) {
    try {
        const prompter = JSON.parse(sessionStorage.getItem(OBTAIN_KEY))
        console.log(prompter.prompt)
        _secured[prompter.variable][prompter.action](key, permanently)
        if (window[prompter.variable].isLocked()) {
            return false
        }
        const url = prompter.url
        sessionStorage.removeItem(OBTAIN_KEY)
        window.location.href = url
    } catch (err) {
        console.log(err)
    }
    return true
}

function leave() {
    if (sessionStorage.getItem(LEAVE_WHAT) !== null) {
        const what = sessionStorage.getItem(LEAVE_WHAT)
        _secured[what].lock()
    }
    window.location.href = MAIN_URL
}

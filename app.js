const express = require('express')
const app = express()
const port = 3000

let api = require('@actual-app/api')
let budgetId = process.env.BUDGET_ID || ''
let serverURL = process.env.SERVER_URL || ''
let serverPassword = process.env.SERVER_PASSWORD || ''
let dataDir = process.env.DATA_DIR || 'data'

app.get('/accounts', async (req, res) => {

    await api.init({
        dataDir: dataDir,
        serverURL: serverURL,
        password: serverPassword
    });
    console.log('API initialized')
    let budget = await api.downloadBudget(budgetId)
    console.log(`Budget ${budgetId} downloaded`)
    let accounts = await api.getAccounts()
    console.log('Accounts downloaded')

    // for each account, get account balance using id
    let output = []
    for (let account of accounts) {
        let balance = await api.getAccountBalance(account.id)
        output.push({
            name: account.name,
            // balance is an integer
            // convert to dollar value like $1,234.56 -- final two digits are cents
            // use locale
            balance: (balance / 100).toFixed(2)
        })
    }
    // sort balance descending
    output.sort((a, b) => {
        return b.balance - a.balance
    })

    // update balance to locale string
    for (let account of output) {
        account.balance = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(account.balance)
    }
    // response should be in format {'accounts': output}
    res.send({
        accounts: output
    })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

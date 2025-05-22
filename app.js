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
    console.debug('API initialized')
    let budget = await api.downloadBudget(budgetId)
    console.debug(`Budget ${budgetId} downloaded`)
    let accounts = await api.getAccounts()
    console.debug('Accounts downloaded')

    // for each account, get account balance using id
    let output = []
    for (let account of accounts) {
        console.debug('Account', account)
        let balance = await api.getAccountBalance(account.id)
        let data = {}
        data['name'] = account.name
        data['balance'] = (balance / 100).toFixed(2)
        
        // if account.offbudget is true, we'll process it
        if (account.offbudget) {
            console.debug(`Account ${account.name} is an investment account`)
            endDate = new Date()
            let ytdrateOfReturn = await calculateRateOfReturn(account.id, new Date(endDate.getFullYear(), 0, 1), endDate)
            data['ytd'] = ytdrateOfReturn
        }
        output.push(data)
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

// Utility function get payee by name
async function getPayeeByName(name) {
    let payees = await api.getPayees()
    for (let payee of payees) {
        if (payee.name === name) {
            return payee.id
        }
    }
    return null
}

// Utility function to calculate rate of return for a given account and date range
async function calculateRateOfReturn(accountId) {
    // get transactions for this year
    let transactions = await api.getTransactions(accountId, new Date(new Date().getFullYear(), 0, 1), new Date())
    // sort transactions asc
    transactions.sort((a, b) => {
        return new Date(a.date) - new Date(b.date)
    })
    
    // start date is up to the last day of the previous year
    let startDate = new Date(new Date().getFullYear() - 1, 11, 31)
    // starting balance is the sum of all transactions up to and including the start date
    let startingBalance = 0
    for (let transaction of transactions) {
        if (new Date(transaction.date) <= startDate) {
            startingBalance += transaction.amount / 100
        }
    }

    let payee = await getPayeeByName('Starting Balance')
    if (startingBalance === 0) {
        console.debug(`No transactions found for account ${accountId} before ${startDate}`)
        if (payee) {
            console.debug(`Payee found: ${payee}`)
            for (let transaction of transactions) {
                if (transaction.payee === payee) {
                    console.debug('Transaction found:', transaction)
                    startingBalance = transaction.amount / 100
                    break
                }
            }
        }
    }

    console.debug(`Starting balance for account ${accountId} on ${startDate} is ${startingBalance}`)
    
    // final balance is the sum of the remaining transactions
    let finalBalance = startingBalance
    for (let transaction of transactions) {
        if (new Date(transaction.date) > startDate) {
            if (transaction.payee !== payee) {
                finalBalance += transaction.amount / 100
            }
        }
    }
    console.debug(`Final balance for account ${accountId} on ${new Date()} is ${finalBalance}`)

    // calculate rate of return
    let rateOfReturn = (finalBalance - startingBalance) / startingBalance
    console.debug(`Rate of return for account ${accountId} is ${rateOfReturn}`)
    return rateOfReturn.toLocaleString('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}


app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

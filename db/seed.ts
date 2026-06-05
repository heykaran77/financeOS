import 'dotenv/config';
import { db } from './index';
import {
  bankAccount,
  category,
  tag,
  transaction,
  transactionTag,
  budget,
  recurringTransaction,
  goal,
} from './schema/schema';

const USER_ID = 'Dua383C1kaR02uzSbAw0t1L5M7VXdTbg';

async function seed() {
  console.log('Seeding database for user:', USER_ID);

  try {
    // 1. Bank Accounts
    console.log('Inserting Bank Accounts...');
    const [checking, _savings, creditCard] = await db
      .insert(bankAccount)
      .values([
        {
          userId: USER_ID,
          name: 'HDFC Checking',
          type: 'checking',
          balance: '50000.00',
          currency: 'INR',
          color: '#1E3A8A',
        },
        {
          userId: USER_ID,
          name: 'ICICI Savings',
          type: 'savings',
          balance: '250000.00',
          currency: 'INR',
          color: '#DC2626',
        },
        {
          userId: USER_ID,
          name: 'Amex Platinum',
          type: 'credit_card',
          balance: '-15000.00',
          currency: 'INR',
          color: '#9CA3AF',
        },
      ])
      .returning();

    // 2. Categories
    console.log('Inserting Categories...');
    const [foodCat, transportCat, salaryCat, entertainmentCat] = await db
      .insert(category)
      .values([
        {
          userId: USER_ID,
          name: 'Food & Dining',
          type: 'expense',
          icon: '🍔',
          color: '#F59E0B',
        },
        {
          userId: USER_ID,
          name: 'Transportation',
          type: 'expense',
          icon: '🚗',
          color: '#3B82F6',
        },
        {
          userId: USER_ID,
          name: 'Salary',
          type: 'income',
          icon: '💰',
          color: '#10B981',
        },
        {
          userId: USER_ID,
          name: 'Entertainment',
          type: 'expense',
          icon: '🎬',
          color: '#8B5CF6',
        },
      ])
      .returning();

    // 3. Tags
    console.log('Inserting Tags...');
    const [vacationTag, taxTag, subTag] = await db
      .insert(tag)
      .values([
        { userId: USER_ID, name: 'vacation', color: '#14B8A6' },
        { userId: USER_ID, name: 'tax-deductible', color: '#EF4444' },
        { userId: USER_ID, name: 'subscription', color: '#EC4899' },
      ])
      .returning();

    // 4. Recurring Transactions
    console.log('Inserting Recurring Transactions...');
    const [netflixRec, _rentRec] = await db
      .insert(recurringTransaction)
      .values([
        {
          userId: USER_ID,
          bankAccountId: creditCard.id,
          categoryId: entertainmentCat.id,
          amount: '649.00',
          type: 'expense',
          description: 'Netflix Premium',
          frequency: 'monthly',
          nextDueDate: new Date('2026-06-01'),
        },
        {
          userId: USER_ID,
          bankAccountId: checking.id,
          amount: '25000.00',
          type: 'expense',
          description: 'Monthly Rent',
          frequency: 'monthly',
          nextDueDate: new Date('2026-06-01'),
        },
      ])
      .returning();

    // 5. Transactions
    console.log('Inserting Transactions...');
    const today = new Date();
    const generatedTransactions = [];

    // Generate transactions for the last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(today);
      monthDate.setMonth(today.getMonth() - i);

      // Salary (once a month)
      generatedTransactions.push({
        userId: USER_ID,
        bankAccountId: checking.id,
        categoryId: salaryCat.id,
        amount: '120000.00',
        type: 'income',
        description: `${monthDate.toLocaleString('default', { month: 'short' })} Salary`,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), // 1st of month
        paymentMethod: 'net_banking',
        source: 'Acme Corp',
      });

      // Rent (once a month)
      generatedTransactions.push({
        userId: USER_ID,
        bankAccountId: checking.id,
        amount: '25000.00',
        type: 'expense',
        description: 'Monthly Rent',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5),
        paymentMethod: 'net_banking',
      });

      // Netflix (once a month)
      generatedTransactions.push({
        userId: USER_ID,
        bankAccountId: creditCard.id,
        categoryId: entertainmentCat.id,
        amount: '649.00',
        type: 'expense',
        description: 'Netflix Premium',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
        paymentMethod: 'card',
        isRecurring: true,
        recurringTransactionId: netflixRec.id,
      });

      // Random daily expenses
      const numExpenses = 8 + Math.floor(Math.random() * 5); // 8-12 expenses per month
      for (let j = 0; j < numExpenses; j++) {
        const randDay = 1 + Math.floor(Math.random() * 27);
        const tDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          randDay,
        );

        // Pick random category (food, transport, entertainment)
        const cats = [foodCat, transportCat, entertainmentCat];
        const cat = cats[Math.floor(Math.random() * cats.length)];

        // Random amount between 200 and 5000
        const amt = (200 + Math.random() * 4800).toFixed(2);

        generatedTransactions.push({
          userId: USER_ID,
          bankAccountId: creditCard.id,
          categoryId: cat.id,
          amount: amt,
          type: 'expense',
          description: `${cat.name} Expense`,
          date: tDate,
          paymentMethod: 'card',
        });
      }
    }

    const insertedTxs = await db
      .insert(transaction)
      .values(generatedTransactions as (typeof transaction.$inferInsert)[])
      .returning();

    // 6. Transaction Tags
    console.log('Inserting Transaction Tags...');
    if (insertedTxs.length >= 4) {
      await db.insert(transactionTag).values([
        { transactionId: insertedTxs[1].id, tagId: vacationTag.id },
        { transactionId: insertedTxs[2].id, tagId: taxTag.id },
        { transactionId: insertedTxs[3].id, tagId: subTag.id },
      ]);
    }

    // 7. Budgets
    console.log('Inserting Budgets...');
    await db.insert(budget).values([
      {
        userId: USER_ID,
        categoryId: foodCat.id,
        amount: '15000.00',
        period: 'monthly',
        startDate: new Date('2026-05-01'),
      },
      {
        userId: USER_ID,
        categoryId: entertainmentCat.id,
        amount: '5000.00',
        period: 'monthly',
        startDate: new Date('2026-05-01'),
      },
    ]);

    // 8. Goals
    console.log('Inserting Goals...');
    await db.insert(goal).values([
      {
        userId: USER_ID,
        name: 'Emergency Fund',
        description: '6 months of living expenses',
        targetAmount: '300000.00',
        currentAmount: '50000.00',
        targetDate: new Date('2026-12-31'),
        status: 'in_progress',
      },
      {
        userId: USER_ID,
        name: 'Europe Vacation',
        description: 'Trip to Italy and Switzerland',
        targetAmount: '450000.00',
        currentAmount: '20000.00',
        targetDate: new Date('2027-05-01'),
        status: 'in_progress',
      },
      {
        userId: USER_ID,
        name: 'New Laptop',
        description: 'MacBook Pro M4',
        targetAmount: '250000.00',
        currentAmount: '250000.00',
        targetDate: new Date('2026-05-15'),
        status: 'completed',
      },
    ]);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();

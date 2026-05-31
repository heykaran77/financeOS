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
    const [checking, savings, creditCard] = await db
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
    const [netflixRec, rentRec] = await db
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
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const [t1, t2, t3, t4, t5] = await db
      .insert(transaction)
      .values([
        {
          userId: USER_ID,
          bankAccountId: checking.id,
          categoryId: salaryCat.id,
          amount: '120000.00',
          type: 'income',
          description: 'May Salary',
          date: today,
          paymentMethod: 'net_banking',
          source: 'Acme Corp',
        },
        {
          userId: USER_ID,
          bankAccountId: creditCard.id,
          categoryId: foodCat.id,
          amount: '1250.00',
          type: 'expense',
          description: 'Dinner at Italian Restaurant',
          date: yesterday,
          paymentMethod: 'card',
        },
        {
          userId: USER_ID,
          bankAccountId: checking.id,
          categoryId: transportCat.id,
          amount: '450.00',
          type: 'expense',
          description: 'Uber to office',
          date: today,
          paymentMethod: 'upi',
        },
        {
          userId: USER_ID,
          bankAccountId: checking.id, // Transfer out of checking
          amount: '10000.00',
          type: 'transfer',
          description: 'Transfer to Savings',
          date: today,
          paymentMethod: 'net_banking',
        },
        {
          userId: USER_ID,
          bankAccountId: creditCard.id,
          categoryId: entertainmentCat.id,
          amount: '649.00',
          type: 'expense',
          description: 'Netflix Premium',
          date: today,
          paymentMethod: 'card',
          isRecurring: true,
          recurringTransactionId: netflixRec.id,
        },
      ])
      .returning();

    // 6. Transaction Tags
    console.log('Inserting Transaction Tags...');
    await db.insert(transactionTag).values([
      { transactionId: t2.id, tagId: vacationTag.id },
      { transactionId: t3.id, tagId: taxTag.id },
      { transactionId: t5.id, tagId: subTag.id },
    ]);

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

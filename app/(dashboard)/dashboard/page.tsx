export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-muted/50 rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 font-medium">Total Balance</h3>
          <p className="text-2xl font-bold">$10,000.00</p>
        </div>
        <div className="bg-muted/50 rounded-lg border p-4 shadow-sm">
          <h3 className="mb-2 font-medium">Recent Transactions</h3>
          <p className="text-muted-foreground text-sm">View all transactions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="bg-muted/50 rounded-lg border p-4 shadow-sm">
            <h3 className="mb-2 font-medium">Spending Overview</h3>
            <div className="aspect-video w-full">Chart Placeholder</div>
          </div>
        </div>

        <div>
          <div className="bg-muted/50 rounded-lg border p-4 shadow-sm">
            <h3 className="mb-2 font-medium">Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Groceries</span>
                <span>$400</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Transport</span>
                <span>$150</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Entertainment</span>
                <span>$200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

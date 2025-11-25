-- Transactions Schema for Get Plot

CREATE SCHEMA IF NOT EXISTS transactions;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    property_id UUID NOT NULL,
    location VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('reservation', 'purchase')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    
    -- Amounts
    total_amount DECIMAL(15, 2) NOT NULL,
    deposit_amount DECIMAL(15, 2),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    customer_details JSONB,
    
    -- Timestamps
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (for tracking individual payments)
CREATE TABLE IF NOT EXISTS transactions.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions.transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_proof TEXT,
    verified_by UUID REFERENCES app_auth.users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property ON transactions.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions.transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_transaction ON transactions.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON transactions.payments(status);

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Transactions schema initialized successfully';
END $$;


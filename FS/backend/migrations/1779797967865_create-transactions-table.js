exports.up = (pgm) => {
  pgm.createTable('transactions', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    category: { type: 'varchar(100)' },
    amount: { type: 'numeric', notNull: true },
    type: { type: 'varchar(50)' },
    date: { type: 'varchar(50)' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('transactions');
};
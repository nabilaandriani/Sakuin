exports.up = (pgm) => {
  pgm.createTable("savings_goals", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },

    nama: {
      type: "varchar(255)",
      notNull: true,
    },

    emoji: {
      type: "varchar(50)",
    },

    warna: {
      type: "varchar(50)",
    },

    target: {
      type: "numeric",
      notNull: true,
    },

    terkumpul: {
      type: "numeric",
      default: 0,
    },

    deadline: {
      type: "date",
    },

    catatan: {
      type: "text",
    },

    tercapai: {
      type: "boolean",
      default: false,
    },

    tanggal_tercapai: {
      type: "timestamp",
    },

    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("savings_goals");
};

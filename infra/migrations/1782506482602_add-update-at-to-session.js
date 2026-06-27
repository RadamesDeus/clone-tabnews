exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("sessions", {
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc'::text, now())"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("sessions", "updated_at");
};

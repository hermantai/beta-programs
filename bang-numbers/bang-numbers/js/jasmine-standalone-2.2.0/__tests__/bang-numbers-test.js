describe('numbers_text_to_numbers', function () {
  it('empty text outputs empty array', function () {
    expect(numbers_text_to_numbers("")).toEqual([]);
  });

  it('text with no numbers outputs empty array', function () {
    expect(numbers_text_to_numbers("abcde")).toEqual([]);
  });

  it('1 number outputs array with 1 number', function () {
    expect(numbers_text_to_numbers("123")).toEqual([123]);
  });

  it('2 numbers outputs array with 2 numbers', function () {
    expect(numbers_text_to_numbers("123 456")).toEqual([123, 456]);
  });

  it('floating number', function () {
    expect(numbers_text_to_numbers("1.23")).toEqual([1.23]);
  });

  it('number with leading dot', function () {
    expect(numbers_text_to_numbers(".1")).toEqual([0.1]);
  });

  it('number with trailing dot', function () {
    expect(numbers_text_to_numbers("1.")).toEqual([1]);
  });

  it('negative number', function () {
    expect(numbers_text_to_numbers("-1.23")).toEqual([-1.23]);
  });

  it('numbers connected by dashes', function () {
    expect(numbers_text_to_numbers("1-2")).toEqual([1, 2]);
  });

  it(
    'negative number connected by dashes outputs 2 numbers first being negative',
    function () {
      expect(numbers_text_to_numbers("-1-2")).toEqual([-1, 2]);
    }
  );

  it(
    'numbers connected by 2 dots',
    function () {
      expect(numbers_text_to_numbers("1.2.3")).toEqual([1, 2, 3]);
    }
  );

  it(
    'Numbers connected by 2 dots and repeated dots',
    function () {
      expect(numbers_text_to_numbers("1.2...3")).toEqual([1, 2, 3]);
    }
  );

  it(
    'Text with only dots outputs empty array',
    function () {
      expect(numbers_text_to_numbers("...")).toEqual([]);
    }
  );

  it(
    'Text with only dashes outputs empty array',
    function () {
      expect(numbers_text_to_numbers("---")).toEqual([]);
    }
  );

  it(
    '3 numbers one negative one positive one negative',
    function () {
      expect(numbers_text_to_numbers("-123 234 -456")).toEqual([-123, 234, -456]);
    }
  );
});

import * as abi from '../src/abi';

test('encode with type bytes32 returns the correct result', () => {
  const type = 'bytes32';
  const payload =
    'ca3499e52bff578a0666de60da6560aabf558d94ad041dd49534ebb39dc99918';

  const expected = {
    data: '0x003499e52bff578a0666de60da6560aabf558d94ad041dd49534ebb39dc99918',
    dynamic: false,
  };

  const actual = abi.encode(type, payload);

  expect(actual).toEqual(expected);
});

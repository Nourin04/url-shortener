CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"


def encode_base62(number):
    if number == 0:
        return CHARACTERS[0]

    result = ""

    while number > 0:
        remainder = number % 62
        result = CHARACTERS[remainder] + result
        number = number // 62

    return result


def decode_base62(code):
    number = 0

    for character in code:
        value = CHARACTERS.index(character)
        number = number * 62 + value

    return number


print(encode_base62(125))
print(decode_base62("21"))

print(encode_base62(1000))
print(decode_base62("g8"))
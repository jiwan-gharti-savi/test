import codecs
import pickle

encoded_value = "0x8005953B000000000000007D94288C03706964944DAA418C08686F73746E616D65948C1F63656C657279404A6977616E732D4D6163426F6F6B2D50726F2E6C6F63616C94752E"
decoded_value = codecs.decode(encoded_value.replace("0x", ""), "hex")
unpickled_object = pickle.loads(decoded_value)

print(unpickled_object)
class PHPBytesParser:
    def __init__(self, data_bytes):
        self.data = data_bytes
        self.idx = 0
        self.len = len(data_bytes)

    def parse(self):
        if self.idx >= self.len:
            return None
        
        char = chr(self.data[self.idx])
        self.idx += 1 # Consume type char
        
        if char == 'N': # Null
            if self.idx < self.len and chr(self.data[self.idx]) == ';':
                self.idx += 1
            return None
            
        if self.idx < self.len and chr(self.data[self.idx]) == ':':
            self.idx += 1
            
        if char == 'i': # Integer
            end = self.data.find(b';', self.idx)
            val = int(self.data[self.idx:end])
            self.idx = end + 1
            return val
            
        elif char == 'd': # Double / Float
            end = self.data.find(b';', self.idx)
            val = float(self.data[self.idx:end])
            self.idx = end + 1
            return val
            
        elif char == 'b': # Boolean
            end = self.data.find(b';', self.idx)
            val = self.data[self.idx:end] == b'1'
            self.idx = end + 1
            return val
            
        elif char == 's': # String
            # Format: s:length:"value";
            end_len = self.data.find(b':', self.idx)
            length = int(self.data[self.idx:end_len])
            self.idx = end_len + 2 # Skip ': "'
            val_bytes = self.data[self.idx:self.idx+length]
            val = val_bytes.decode('utf-8', errors='ignore')
            self.idx = self.idx + length + 2 # Skip '";'
            return val
            
        elif char == 'a': # Array
            # Format: a:size:{key;value;key;value;...}
            end_size = self.data.find(b':', self.idx)
            size = int(self.data[self.idx:end_size])
            self.idx = end_size + 2 # Skip ':{'
            
            arr = {}
            for _ in range(size):
                k = self.parse()
                v = self.parse()
                arr[k] = v
                
            if self.idx < self.len and chr(self.data[self.idx]) == '}':
                self.idx += 1
            return arr
            
        elif char == 'O': # Object
            # Format: O:len:"name":size:{key;value;...}
            end_len = self.data.find(b':', self.idx)
            class_len = int(self.data[self.idx:end_len])
            self.idx = end_len + 2 # Skip ':"'
            class_name = self.data[self.idx:self.idx+class_len].decode('utf-8', errors='ignore')
            self.idx = self.idx + class_len + 2 # Skip '":'
            
            end_size = self.data.find(b':', self.idx)
            size = int(self.data[self.idx:end_size])
            self.idx = end_size + 2 # Skip ':{'
            
            obj = {'__class__': class_name}
            for _ in range(size):
                k = self.parse()
                v = self.parse()
                obj[k] = v
                
            if self.idx < self.len and chr(self.data[self.idx]) == '}':
                self.idx += 1
            return obj
            
        return None

def phpserialize_parse(s):
    if not s or s == 'None':
        return None
    try:
        parser = PHPBytesParser(s.encode('utf-8'))
        return parser.parse()
    except Exception as e:
        print(f"Error parsing PHP serialized data: {e}")
        return None

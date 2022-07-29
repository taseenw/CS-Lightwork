#Bubble Sort Algorithm - Python
#Author: Taseen Waseq

list = [5,64,32,2,3,1]
print(list)

sorted = False
indexingLength = len(list)-1
while not sorted:
    sorted = True
    for currentElement in range(indexingLength):
        if list[currentElement] > list[currentElement+1]:
            sorted = False
            list[currentElement], list[currentElement+1] = list[currentElement+1], list[currentElement]

print(list)

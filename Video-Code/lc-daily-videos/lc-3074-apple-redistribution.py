class Solution(object):
    def minimumBoxes(self, apple, capacity):
        totalSum = sum(apple)

        boxes = 0

        capacity.sort(reverse=True)

        for c in capacity:
            totalSum-=c
            boxes+=1
            if totalSum <=0:
                break
        
        return boxes
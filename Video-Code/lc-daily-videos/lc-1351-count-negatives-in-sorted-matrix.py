class Solution(object):
    def countNegatives(self, grid):
        m, n = len(grid), len(grid[0])
        count = 0
        row = m - 1
        col = 0
        
        while row >= 0 and col < n:
            if grid[row][col] < 0:
                # All elements to the right are also negative
                count += n - col
                row -= 1
            else:
                col += 1
        
        return count
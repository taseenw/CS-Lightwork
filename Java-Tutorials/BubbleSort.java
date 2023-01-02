//Bubble Sort Algorithm - Java
//Author: Taseen Waseq

class BubbleSort {

    public static void bubbleSort(int [] numbers){
        int placeholder;
        int len = numbers.length;

        for(int i =0; i < len; i++){
            for(int x = 0; x < len - 1; x++){
                if(numbers[x] < numbers[x + 1]){
                    placeholder = numbers[x];
                    numbers[x] = numbers[x + 1];
                    numbers[x + 1] = placeholder;
                }
            }
        }
    }

    public static void main( String args[] ) {
        int [] array = {5,64,32,2,3,1};
        int len = array.length;

        System.out.println("Before sorting: ");
        for(int i = 0; i<len; ++i){
            System.out.print(array[i] + " ");
        }

        bubbleSort(array);

        System.out.println("\nAfter sorting: ");
        for(int i = 0; i<len; ++i){
            System.out.print(array[i] + " ");
        }
    }
    
}

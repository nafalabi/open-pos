echo "set terminal png
set output 'output/memusage.png'
set datafile separator ' '
set xdata time
set timefmt '%H:%M:%S'
set format x '%H:%M:%S'
plot 'output/memusage.txt' using 1:2 with lines title 'Memory consumption'" | gnuplot
echo "plot graph is generated in 'output/memusage.png'"

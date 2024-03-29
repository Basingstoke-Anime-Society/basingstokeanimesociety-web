show1 ?= ""
show2 ?= ""
show3 ?= ""
date ?= ""

make:
	mkdir -p bookends
	cd src; npm run make

help:
	@echo "  make interval3 show1=<show1> show2=<show2> show3=<show3> date=<date>"
	@echo "  make interval2 show1=<show1> show2=<show2> date=<date>"
	@echo "  make interval1 show1=<show1> date=<date>"
	@echo ""
	@echo "  make bookend3 show1=<show1> show2=<show2> show3=<show3> date=<date>"
	@echo "  make bookend2 show1=<show1> show2=<show2> date=<date>"
	@echo "  make bookend1 show1=<show1> date=<date>"
	@echo ""
	@echo "  make serve"

interval3:
	mkdir -p bookends
	cd src; node ./make-interval3 "$(show1)" "$(show2)" "$(show3)" "$(date)"

interval2:
	mkdir -p bookends
	cd src; node ./make-interval2 "$(show1)" "$(show2)" "$(date)"

interval1:
	mkdir -p bookends
	cd src; node ./make-interval1 "$(show1)" "$(date)"

bookend3:
	mkdir -p bookends
	cd src; node ./make-bookend3 "$(show1)" "$(show2)" "$(show3)" "$(date)"

bookend2:
	mkdir -p bookends
	cd src; node ./make-bookend2 "$(show1)" "$(show2)" "$(date)"

bookend1:
	mkdir -p bookends
	cd src; node ./make-bookend1 "$(show1)" "$(date)"

serve:
	cd src; npx http-server -d false ../dist